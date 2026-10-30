import { test } from 'node:test'
import assert from 'node:assert/strict'
import { releaseContext } from '../scripts/release-context.js'

const version = '4.0.0-rc.1'
const digest = 'a'.repeat(64)
const revision = 'b'.repeat(40)
const release = {
  tag_name: `v${version}`,
  draft: false,
  prerelease: true,
  published_at: '2026-10-30T10:25:15Z',
}
const manual = (overrides = {}) => ({
  eventName: 'workflow_dispatch',
  event: {
    inputs: { release_tag: release.tag_name, expected_tarball_sha256: digest },
  },
  ref: 'refs/heads/main',
  version,
  request: async (path) => {
    if (path.startsWith('releases/tags/')) return release
    if (path.startsWith('git/ref/tags/'))
      return { object: { type: 'commit', sha: revision } }
    throw new Error(`Unexpected API request: ${path}`)
  },
  ...overrides,
})

test('PR dry runs use next without looking up or authorizing a release', async () => {
  assert.deepEqual(await releaseContext({ eventName: 'pull_request' }), {
    npmTag: 'next',
    expectedDigest: '',
    originalRevision: '',
  })
})

test('published release metadata selects next or latest', async () => {
  for (const [prerelease, npmTag] of [
    [true, 'next'],
    [false, 'latest'],
  ]) {
    const context = await releaseContext({
      eventName: 'release',
      event: { release: { ...release, prerelease } },
      version,
    })
    assert.equal(context.npmTag, npmTag)
    assert.equal(context.expectedDigest, '')
  }
})

test('manual recovery binds existing release, original revision and expected bytes', async () => {
  assert.deepEqual(await releaseContext(manual()), {
    npmTag: 'next',
    expectedDigest: digest,
    originalRevision: revision,
  })
  const context = await releaseContext(
    manual({
      request: async (path) => {
        if (path.startsWith('releases/'))
          return { ...release, prerelease: false }
        if (path.startsWith('git/ref/'))
          return { object: { type: 'tag', sha: 'c'.repeat(40) } }
        return { object: { type: 'commit', sha: revision } }
      },
    }),
  )
  assert.equal(context.npmTag, 'latest')
  assert.equal(context.originalRevision, revision)
})

test('manual recovery refuses other branches and missing or invalid byte identity', async () => {
  await assert.rejects(
    releaseContext(manual({ ref: 'refs/heads/feature' })),
    /main/,
  )
  for (const expected of ['', 'not-a-sha256']) {
    await assert.rejects(
      releaseContext(
        manual({
          event: {
            inputs: {
              release_tag: release.tag_name,
              expected_tarball_sha256: expected,
            },
          },
        }),
      ),
      /digest/,
    )
  }
})

test('missing, unpublished, mismatched or malformed releases cannot authorize publishing', async () => {
  await assert.rejects(
    releaseContext(
      manual({
        request: async () => {
          throw new Error('GitHub 404')
        },
      }),
    ),
    /404/,
  )
  for (const invalid of [
    { ...release, draft: true },
    { ...release, published_at: null },
    { ...release, tag_name: 'v9.0.0' },
    { ...release, prerelease: undefined },
  ]) {
    await assert.rejects(
      releaseContext(manual({ request: async () => invalid })),
      /release|version/,
    )
  }
  await assert.rejects(
    releaseContext(
      manual({
        request: async (path) =>
          path.startsWith('releases/')
            ? release
            : { object: { type: 'tree', sha: revision } },
      }),
    ),
    /commit/,
  )
})

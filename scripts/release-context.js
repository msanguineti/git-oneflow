import { appendFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const releaseContext = async ({
  eventName,
  event,
  ref,
  version,
  request,
}) => {
  if (eventName === 'pull_request')
    return { npmTag: 'next', expectedDigest: '', originalRevision: '' }

  let release = event.release
  let expectedDigest = ''
  let originalRevision = ''
  if (eventName === 'workflow_dispatch') {
    if (ref !== 'refs/heads/main') throw new Error('Recovery must run on main')
    expectedDigest = event.inputs?.expected_tarball_sha256 ?? ''
    if (!/^[a-f0-9]{64}$/.test(expectedDigest))
      throw new Error('Recovery requires the original tarball digest')
    if (event.inputs?.release_tag !== `v${version}`)
      throw new Error('Release tag must match package version')
    const tag = encodeURIComponent(event.inputs.release_tag)
    release = await request(`releases/tags/${tag}`)
  } else if (eventName !== 'release') {
    throw new Error('Unsupported release event')
  }
  if (
    release?.tag_name !== `v${version}` ||
    release.draft !== false ||
    typeof release.published_at !== 'string' ||
    !release.published_at ||
    typeof release.prerelease !== 'boolean'
  )
    throw new Error(
      'A published release matching the package version is required',
    )
  if (eventName === 'workflow_dispatch') {
    const tag = encodeURIComponent(event.inputs.release_tag)
    let target = (await request(`git/ref/tags/${tag}`)).object
    for (let depth = 0; target?.type === 'tag' && depth < 5; depth++)
      target = (await request(`git/tags/${target.sha}`)).object
    if (target?.type !== 'commit' || !/^[a-f0-9]{40}$/.test(target.sha))
      throw new Error('Release tag must resolve to a commit')
    originalRevision = target.sha
  }
  return {
    npmTag: release.prerelease ? 'next' : 'latest',
    expectedDigest,
    originalRevision,
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  const context = await releaseContext({
    eventName: process.env.GITHUB_EVENT_NAME,
    event: JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')),
    ref: process.env.GITHUB_REF,
    version: JSON.parse(readFileSync('package.json', 'utf8')).version,
    request: async (path) => {
      const response = await fetch(
        `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/${path}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
          signal: AbortSignal.timeout(15000),
        },
      )
      if (!response.ok)
        throw new Error(`GitHub release lookup: ${response.status}`)
      return response.json()
    },
  })
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `npm_tag=${context.npmTag}\nexpected_digest=${context.expectedDigest}\noriginal_revision=${context.originalRevision}\n`,
  )
  console.log(
    `Build source: ${process.env.GITHUB_SHA}; npm tag: ${context.npmTag}`,
  )
  if (context.originalRevision)
    console.log(`Original release source: ${context.originalRevision}`)
}

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cli = fileURLToPath(new URL('../bin/cli.js', import.meta.url))
const version = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url)),
).version

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'oneflow-test-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !/^(GOF_|GIT_)/i.test(key)),
  )
  Object.assign(env, {
    HOME: root,
    USERPROFILE: root,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: join(root, 'gitconfig'),
    GIT_AUTHOR_NAME: 'Test',
    GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'Test',
    GIT_COMMITTER_EMAIL: 'test@example.com',
    GIT_TERMINAL_PROMPT: '0',
  })
  const git = (...args) =>
    execFileSync('git', args, { cwd: root, env, encoding: 'utf8' }).trim()
  const run = (...args) => {
    const result = spawnSync(process.execPath, [cli, ...args], {
      cwd: root,
      env,
      encoding: 'utf8',
    })
    assert.equal(result.status, 0, result.stderr)
    return result.stdout
  }
  git('init', '-b', 'main')
  writeFileSync(join(root, 'file'), 'initial\n')
  git('add', 'file')
  git('commit', '-m', 'initial')
  return { root, git, run }
}

test('help, version and initialization in a repository', (t) => {
  const { root, run } = fixture(t)
  assert.match(run('--help'), /Usage: git-oneflow/)
  assert.match(run('--version'), new RegExp(version.replaceAll('.', '\\.')))
  assert.match(run('init', '-y'), /new configuration file created/)
  assert.equal(
    JSON.parse(readFileSync(join(root, '.git-oneflowrc'))).main,
    'main',
  )
})

test('a noninteractive feature cycle updates real Git history', (t) => {
  const { root, git, run } = fixture(t)
  const initial = git('rev-parse', 'main')
  run('start', 'feature', 'example')
  assert.equal(git('branch', '--show-current'), 'feature/example')
  writeFileSync(join(root, 'file'), 'feature\n')
  git('add', 'file')
  git('commit', '-m', 'feature')
  const feature = git('rev-parse', 'HEAD')
  run(
    'finish',
    'feature',
    'example',
    '--no-interactive',
    '--no-push',
    '--no-delete',
  )
  assert.equal(git('branch', '--show-current'), 'main')
  assert.notEqual(git('rev-parse', 'main'), initial)
  assert.equal(git('rev-parse', 'main'), feature)
  assert.equal(readFileSync(join(root, 'file'), 'utf8'), 'feature\n')
})

test('dry-run leaves repository state unchanged', (t) => {
  const { git, run } = fixture(t)
  const before = [
    git('status', '--porcelain=v1'),
    git('show-ref'),
    git('stash', 'list'),
  ]
  assert.match(
    run('start', 'feature', 'preview', '--dry-run'),
    /dry-run: git checkout -b feature\/preview main/,
  )
  assert.deepEqual(
    [git('status', '--porcelain=v1'), git('show-ref'), git('stash', 'list')],
    before,
  )
})

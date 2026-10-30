import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cli =
  process.env.ONEFLOW_CLI ||
  fileURLToPath(new URL('../bin/index.js', import.meta.url))
const version = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url)),
).version

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'oneflow test -'))
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
  const raw = (...args) =>
    spawnSync(process.execPath, [cli, ...args], {
      cwd: root,
      env,
      encoding: 'utf8',
      timeout: 5000,
    })
  return { root, git, run, raw }
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
  const { root, git, run } = fixture(t)
  writeFileSync(join(root, 'file'), 'uncommitted changes\n')
  writeFileSync(join(root, 'untracked'), 'untracked\n')
  const before = [
    git('status', '--porcelain=v1'),
    git('show-ref'),
    git('stash', 'list'),
  ]
  assert.match(
    run('start', 'feature', 'preview', '--dry-run'),
    /dry-run: git checkout -b feature\/preview refs\/heads\/main/,
  )
  assert.deepEqual(
    [git('status', '--porcelain=v1'), git('show-ref'), git('stash', 'list')],
    before,
  )
})

test('explicit empty prefix and false prompt settings take effect', (t) => {
  const { root, git, raw } = fixture(t)
  writeFileSync(
    join(root, 'settings.json'),
    JSON.stringify({ features: '', askOnFeatureStart: false }),
  )
  const result = raw('start', 'feature', 'example', '--config', 'settings.json')
  assert.equal(result.status, 0, result.stderr)
  assert.equal(git('branch', '--show-current'), 'example')
})

test('failed interactive rebase stops before changing target', (t) => {
  const { root, git, raw } = fixture(t)
  git('checkout', '-b', 'feature/example')
  writeFileSync(join(root, 'file'), 'feature\n')
  git('add', 'file')
  git('commit', '-m', 'feature')
  git('checkout', 'main')
  writeFileSync(join(root, 'other'), 'main\n')
  git('add', 'other')
  git('commit', '-m', 'main')
  const before = git('rev-parse', 'main')
  git('tag', 'existing')
  const remote = join(root, 'remote.git')
  execFileSync('git', ['init', '--bare', remote])
  git('remote', 'add', 'origin', remote)
  git('push', 'origin', 'main', 'feature/example', '--tags')
  const refs = git('show-ref')
  const remoteRefs = execFileSync('git', ['--git-dir', remote, 'show-ref'], {
    encoding: 'utf8',
  })
  // Git runs this command as the interactive sequence editor.
  writeFileSync(join(root, 'gitconfig'), '[sequence]\n editor = false\n')
  const result = raw(
    'finish',
    'feature',
    'example',
    '--interactive',
    '--push',
    '--delete',
  )
  assert.notEqual(result.status, 0)
  assert.equal(git('rev-parse', 'main'), before)
  assert.equal(git('branch', '--show-current'), 'feature/example')
  assert.equal(git('show-ref'), refs)
  assert.equal(
    execFileSync('git', ['--git-dir', remote, 'show-ref'], {
      encoding: 'utf8',
    }),
    remoteRefs,
  )
})

test('help and version bypass configuration and Git; invalid configuration fails', (t) => {
  const { root, raw } = fixture(t)
  writeFileSync(join(root, '.git-oneflowrc'), '{ invalid')
  rmSync(join(root, '.git'), { recursive: true })
  assert.equal(raw('--help').status, 0)
  assert.equal(raw('--version').status, 0)
  assert.notEqual(raw('start', 'feature', 'x').status, 0)
})

test('explicit configuration replaces discovery and invalid settings fail', (t) => {
  const { root, git, raw } = fixture(t)
  writeFileSync(
    join(root, '.git-oneflowrc'),
    JSON.stringify({ features: 'wrong', interactive: true }),
  )
  writeFileSync(join(root, 'settings.json'), JSON.stringify({ features: '' }))
  assert.equal(
    raw('start', 'feature', 'literal', '--config', 'settings.json').status,
    0,
  )
  assert.equal(git('branch', '--show-current'), 'literal')
  for (const config of [
    { unknown: true },
    { interactive: 'false' },
    { strategy: 'invalid' },
  ]) {
    writeFileSync(join(root, 'settings.json'), JSON.stringify(config))
    assert.notEqual(
      raw('start', 'feature', 'x', '--config', 'settings.json').status,
      0,
    )
  }
  assert.notEqual(
    raw('start', 'feature', 'x', '--config', 'missing.json').status,
    0,
  )
})

test('Git inputs are not interpreted by a shell and unsafe refs are rejected', (t) => {
  const { root, git, raw } = fixture(t)
  const name = 'safe;touch PWNED'
  // Spaces are invalid in branch names; the input must not execute a command.
  assert.notEqual(raw('start', 'feature', name, '--no-base').status, 0)
  assert.notEqual(raw('start', 'feature', 'ok', '--ref', '-bad').status, 0)
  assert.equal(git('branch', '--show-current'), 'main')
  assert.throws(() => readFileSync(join(root, 'PWNED')))
  assert.equal(raw('start', 'release', 'v1').status, 0)
  assert.equal(
    raw(
      'finish',
      'release',
      'v1',
      '--tag',
      'v1',
      '--message',
      'literal; $(touch PWNED)',
      '--no-push',
      '--no-delete',
    ).status,
    0,
  )
  assert.match(git('tag', '-l', '-n', 'v1'), /literal; \$\(touch PWNED\)/)
  assert.throws(() => readFileSync(join(root, 'PWNED')))
})

test('conflicting rebase leaves state recoverable and stops downstream actions', (t) => {
  const { root, git, raw } = fixture(t)
  git('checkout', '-b', 'feature/conflict')
  writeFileSync(join(root, 'file'), 'feature\n')
  git('add', 'file')
  git('commit', '-m', 'feature')
  git('checkout', 'main')
  writeFileSync(join(root, 'file'), 'main\n')
  git('add', 'file')
  git('commit', '-m', 'main')
  const before = git('rev-parse', 'main')
  const remote = join(root, 'remote.git')
  execFileSync('git', ['init', '--bare', remote])
  git('remote', 'add', 'origin', remote)
  git('tag', 'existing')
  git('push', 'origin', 'main', 'feature/conflict', '--tags')
  const refs = git('show-ref')
  const remoteRefs = execFileSync('git', ['--git-dir', remote, 'show-ref'], {
    encoding: 'utf8',
  })
  const result = raw(
    'finish',
    'feature',
    'conflict',
    '--no-interactive',
    '--push',
    '--delete',
  )
  assert.notEqual(result.status, 0)
  assert.equal(git('show-ref'), refs)
  assert.match(result.stderr + result.stdout, /rebase --(continue|abort)/)
  assert.equal(git('rev-parse', 'main'), before)
  assert.match(git('status', '--porcelain'), /UU file/)
  assert.equal(
    execFileSync('git', ['--git-dir', remote, 'show-ref'], {
      encoding: 'utf8',
    }),
    remoteRefs,
  )
  assert.equal(git('rev-parse', 'feature/conflict').length, before.length)
})

test('failed push does not delete a merged feature branch', (t) => {
  const { git, raw } = fixture(t)
  git('checkout', '-b', 'feature/example')
  git('commit', '--allow-empty', '-m', 'feature')
  const result = raw(
    'finish',
    'feature',
    'example',
    '--no-interactive',
    '--push',
    '--delete',
  )
  assert.notEqual(result.status, 0)
  assert.ok(git('rev-parse', '--verify', 'refs/heads/feature/example'))
})

for (const strategy of ['rebase', 'no-ff', 'rebase-no-ff']) {
  test(`feature ${strategy} strategy preserves expected history`, (t) => {
    const { git, raw } = fixture(t)
    git('checkout', '-b', 'feature/example')
    git('commit', '--allow-empty', '-m', 'feature')
    const feature = git('rev-parse', 'HEAD')
    git('checkout', 'main')
    git('commit', '--allow-empty', '-m', 'main')
    const target = git('rev-parse', 'HEAD')
    const result = raw(
      'finish',
      'feature',
      'example',
      '--strategy',
      strategy,
      '--no-interactive',
      '--no-push',
      '--no-delete',
    )
    assert.equal(result.status, 0, result.stderr)
    const parents = git('rev-list', '--parents', '-n', '1', 'main').split(' ')
    assert.equal(parents.length, strategy === 'rebase' ? 2 : 3)
    if (strategy === 'no-ff') assert.equal(parents[2], feature)
    assert.equal(git('merge-base', '--is-ancestor', target, 'main'), '')
  })
}

test('hotfix finish rejects missing or unknown targets before changing Git state', (t) => {
  const { root, git, raw } = fixture(t)
  git('switch', '-c', 'hotfix/fix')
  writeFileSync(join(root, 'file'), 'fixed\n')
  git('commit', '-am', 'fix')
  git('switch', 'main')
  const snapshot = () => ({
    refs: git('show-ref'),
    head: git('symbolic-ref', 'HEAD'),
    status: git('status', '--porcelain'),
    file: readFileSync(join(root, 'file'), 'utf8'),
  })
  for (const [target, message] of [
    [[], /hotfix requires --onto/],
    [['--onto', 'missing'], /local branch does not exist/],
  ]) {
    const before = snapshot()
    const result = raw(
      'finish',
      'hotfix',
      'fix',
      ...target,
      '--tag',
      'must-not-exist',
    )
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, message)
    assert.deepEqual(snapshot(), before)
  }
})

test('hotfix finish integrates into the explicitly selected open release', (t) => {
  const { root, git, raw } = fixture(t)
  const main = git('rev-parse', 'main')
  git('branch', 'release/next')
  assert.equal(raw('start', 'hotfix', 'fix').status, 0)
  writeFileSync(join(root, 'file'), 'fixed\n')
  git('commit', '-am', 'fix')
  const fix = git('rev-parse', 'HEAD')
  const result = raw(
    'finish',
    'hotfix',
    'fix',
    '--onto',
    'release/next',
    '--tag',
    'fix-tag',
    '--no-push',
    '--no-delete',
  )
  assert.equal(result.status, 0, result.stderr)
  assert.equal(git('branch', '--show-current'), 'release/next')
  assert.equal(git('rev-parse', 'main'), main)
  assert.equal(git('rev-parse', 'release/next'), fix)
  assert.equal(git('rev-parse', 'fix-tag^{}'), fix)
  assert.equal(readFileSync(join(root, 'file'), 'utf8'), 'fixed\n')
})

test('release and hotfix push tags and target branches to a local remote', (t) => {
  const { root, git, raw } = fixture(t)
  const remote = join(root, 'remote.git')
  execFileSync('git', ['init', '--bare', remote])
  git('remote', 'add', 'origin', remote)
  git('push', '-u', 'origin', 'main')
  for (const [kind, version] of [
    ['release', 'v1'],
    ['hotfix', 'v2'],
  ]) {
    assert.equal(raw('start', kind, version).status, 0)
    git('commit', '--allow-empty', '-m', kind)
    const result = raw(
      'finish',
      kind,
      version,
      ...(kind === 'hotfix' ? ['--onto', 'main'] : []),
      '--tag',
      version,
      '--push',
      '--no-delete',
    )
    assert.equal(result.status, 0, result.stderr)
    assert.equal(
      git('rev-parse', 'main'),
      git('rev-parse', 'refs/remotes/origin/main'),
    )
    assert.equal(
      execFileSync(
        'git',
        ['--git-dir', remote, 'rev-parse', `refs/tags/${version}`],
        { encoding: 'utf8' },
      ).trim(),
      git('rev-parse', `refs/tags/${version}`),
    )
  }
})

test('missing branch cannot restore a matching dirty path', (t) => {
  const { root, git, raw } = fixture(t)
  mkdirSync(join(root, 'feature'))
  writeFileSync(join(root, 'feature', 'missing'), 'original\n')
  git('add', 'feature/missing')
  git('commit', '-m', 'tracked path')
  writeFileSync(join(root, 'feature', 'missing'), 'uncommitted\n')
  assert.notEqual(
    raw('finish', 'feature', 'missing', '--no-push', '--no-delete').status,
    0,
  )
  assert.equal(
    readFileSync(join(root, 'feature', 'missing'), 'utf8'),
    'uncommitted\n',
  )
})

test('feature integration selects branches over same-name tags', (t) => {
  const { git, raw } = fixture(t)
  git('checkout', '-b', 'feature/example')
  git('tag', 'feature/example')
  git('commit', '--allow-empty', '-m', 'feature')
  const feature = git('rev-parse', 'refs/heads/feature/example')
  git('checkout', 'main')
  const result = raw(
    'finish',
    'feature',
    'example',
    '--strategy',
    'no-ff',
    '--no-push',
    '--no-delete',
  )
  assert.equal(result.status, 0, result.stderr)
  assert.equal(git('merge-base', '--is-ancestor', feature, 'main'), '')
})

test('default start reference selects main when a tag has the same name', (t) => {
  const { git, raw } = fixture(t)
  git('tag', 'main')
  git('commit', '--allow-empty', '-m', 'later main')
  const main = git('rev-parse', 'refs/heads/main')
  const result = raw('start', 'feature', 'example')
  assert.equal(result.status, 0, result.stderr)
  assert.equal(git('rev-parse', 'HEAD'), main)
})

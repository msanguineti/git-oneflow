import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = mkdtempSync(join(tmpdir(), 'oneflow installed package -'))
const npm = process.env.npm_execpath
if (!npm) throw new Error('Run this check with npm run test:package')
const runNpm = (args, cwd) =>
  execFileSync(process.execPath, [npm, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, HUSKY: '0' },
  })
try {
  const output = runNpm(
    ['pack', '--json', '--pack-destination', root],
    process.cwd(),
  )
  const artifact = JSON.parse(output.slice(output.indexOf('[')))[0].filename
  writeFileSync(join(root, 'package.json'), '{"private":true}')
  runNpm(
    [
      'install',
      '--omit=dev',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      join(root, artifact),
    ],
    root,
  )
  const version = JSON.parse(
    readFileSync(
      join(root, 'node_modules', 'git-oneflow', 'package.json'),
      'utf8',
    ),
  ).version
  const launcher = (alias, args, cwd) => {
    const executable = join(
      root,
      'node_modules',
      '.bin',
      alias + (process.platform === 'win32' ? '.cmd' : ''),
    )
    if (process.platform === 'win32') {
      return execFileSync(
        'cmd.exe',
        ['/d', '/s', '/c', `""${executable}" ${args.join(' ')}"`],
        { cwd, encoding: 'utf8', windowsVerbatimArguments: true },
      )
    }
    return execFileSync(executable, args, { cwd, encoding: 'utf8' })
  }
  for (const alias of ['gof', 'git-oneflow']) {
    assert.equal(launcher(alias, ['--version'], root).trim(), version)
    assert.match(launcher(alias, ['--help'], root), /Usage: git-oneflow/)
    assert.equal(
      runNpm(['exec', '--no', '--', alias, '--version'], root).trim(),
      version,
    )
  }
  const repo = join(root, 'repository')
  mkdirSync(repo)
  const git = (...args) =>
    execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim()
  git('init', '-b', 'main')
  git('config', 'user.name', 'Test')
  git('config', 'user.email', 'test@example.com')
  git('commit', '--allow-empty', '-m', 'initial')
  launcher('gof', ['init', '-y'], repo)
  writeFileSync(
    join(repo, 'settings.json'),
    JSON.stringify({ features: '', askOnFeatureStart: false }),
  )
  launcher(
    'git-oneflow',
    ['start', 'feature', 'example', '--config', 'settings.json'],
    repo,
  )
  assert.equal(git('branch', '--show-current'), 'example')
  git('commit', '--allow-empty', '-m', 'feature')
  const feature = git('rev-parse', 'HEAD')
  runNpm(
    [
      'exec',
      '--no',
      '--',
      'gof',
      'finish',
      'feature',
      'example',
      '--config',
      'settings.json',
      '--no-interactive',
      '--no-push',
      '--no-delete',
    ],
    repo,
  )
  assert.equal(git('branch', '--show-current'), 'main')
  assert.equal(git('rev-parse', 'main'), feature)
  const cli = join(root, 'node_modules', 'git-oneflow', 'bin', 'index.js')
  execFileSync(process.execPath, ['--test', resolve('tests/cli.test.js')], {
    stdio: 'inherit',
    env: { ...process.env, ONEFLOW_CLI: cli },
  })
} finally {
  rmSync(root, { recursive: true, force: true })
}

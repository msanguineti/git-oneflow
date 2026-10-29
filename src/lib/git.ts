import { spawnSync } from 'child_process'
import { info } from './log.js'

const run = (args: string[], inherit = false) =>
  spawnSync('git', args, {
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : 'pipe',
  })

const failure = (args: string[], result: ReturnType<typeof run>): Error => {
  const detail = result.error?.message ?? result.stderr?.trim() ?? ''
  const reason = result.signal
    ? `terminated by ${result.signal}`
    : detail || `exit ${result.status}`
  const recovery =
    args[0] === 'rebase'
      ? ' Resolve conflicts and run git rebase --continue, or run git rebase --abort.'
      : args[0] === 'merge'
        ? ' Resolve conflicts and commit, or run git merge --abort if a merge is in progress.'
        : ''
  return new Error(`git ${args[0]} failed: ${reason}.${recovery}`)
}

const query = (
  args: string[],
  absentStatuses: number[] = [],
): string | undefined => {
  const result = run(args)
  if (
    result.error ||
    result.signal ||
    (result.status !== 0 && !absentStatuses.includes(result.status ?? -1))
  )
    throw failure(args, result)
  return result.status === 0 ? result.stdout.trim() : undefined
}

const mutate = (args: string[], inherit = false): void => {
  if (process.env.GOF_DRY_RUN) {
    info('dry-run', `git ${args.join(' ')}`)
    return
  }
  const result = run(args, inherit)
  if (result.error || result.signal || result.status !== 0)
    throw failure(args, result)
}

const ref = (value: string): string => {
  if (!value || value.startsWith('-'))
    throw new Error(`invalid Git reference: ${value}`)
  return value
}

const branch = (value: string): string => {
  ref(value)
  if (!isValidBranchName(value))
    throw new Error(`invalid branch name: ${value}`)
  return value
}

export const isOK = (): boolean => {
  const result = run(['status', '--porcelain'])
  return !result.error && !result.signal && result.status === 0
}

export const getLocalBranches = (exclude?: string): string[] =>
  (query(['for-each-ref', '--format=%(refname:short)', 'refs/heads/']) ?? '')
    .split('\n')
    .filter((name) => name && name !== exclude)

export const branchExists = (name: string): boolean =>
  query(
    ['show-ref', '--verify', '--quiet', `refs/heads/${branch(name)}`],
    [1],
  ) !== undefined

export const isValidBranchName = (name: string): boolean => {
  if (!name || name.startsWith('-')) return false
  return query(['check-ref-format', '--branch', name], [1, 128]) !== undefined
}

export const getCurrentBranch = (): string =>
  query(['symbolic-ref', '--short', 'HEAD']) ?? ''

export const createBranch = (
  name: string,
  reference?: string | boolean,
): void => {
  const args = ['checkout', '-b', branch(name)]
  if (typeof reference === 'string') args.push(ref(reference))
  mutate(args)
}

export const getLatestTag = (): string | undefined => {
  const tags = query([
    'for-each-ref',
    '--merged',
    'HEAD',
    '--format=%(objecttype)',
    'refs/tags/',
  ])
  if (!tags?.split('\n').includes('tag')) return undefined
  const tag = query(['describe', '--abbrev=0'])
  return tag ? `refs/tags/${tag}` : undefined
}

export const rebase = (onto: string, interactive?: boolean): void =>
  mutate(
    ['rebase', ...(interactive ? ['-i'] : []), `refs/heads/${branch(onto)}`],
    !!interactive,
  )

export const checkoutBranch = (name: string): void => {
  if (!branchExists(name))
    throw new Error(`local branch does not exist: ${name}`)
  mutate(['switch', '--', branch(name)])
}

export const tagBranch = (tag: string, message?: string): void => {
  ref(tag)
  if (query(['check-ref-format', `refs/tags/${tag}`], [1]) === undefined)
    throw new Error(`invalid tag name: ${tag}`)
  mutate(['tag', ...(message ? ['-a', '-m', message] : []), tag])
}

export const mergeBranch = (
  from: string,
  strategy?: string,
  tag = false,
): void =>
  mutate([
    'merge',
    ...(strategy ? [strategy] : []),
    `${tag ? 'refs/tags' : 'refs/heads'}/${ref(from)}`,
  ])

export const pushToOrigin = (name: string, tag?: string | boolean): void =>
  mutate([
    'push',
    ...(tag ? ['--follow-tags'] : []),
    'origin',
    `refs/heads/${branch(name)}:refs/heads/${name}`,
  ])

export const deleteBranch = (name: string, remote = false): void => {
  branch(name)
  mutate(
    remote ? ['push', 'origin', `:refs/heads/${name}`] : ['branch', '-d', name],
  )
}

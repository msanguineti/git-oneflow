import * as childProcess from 'child_process'
import * as shelljs from 'shelljs'
import * as log from './log'

const executeOrDie = (cmd: string): void => {
  if (process.env.GOF_DRY_RUN) log.info('dry-run', cmd)
  else {
    const { code, stderr } = shelljs.exec(cmd, { silent: true })
    if (0 !== code) {
      log.error(stderr.replace(/^error:/i, '').trim())
      process.exit(code)
    }
  }
}

const noErrorsExec = (cmd: string): boolean =>
  process.env.GOF_DRY_RUN
    ? (log.info('dry-run', cmd), true)
    : 0 === shelljs.exec(cmd, { silent: true }).code

export const isOK = (): boolean => noErrorsExec('git status')

export const getLocalBranches = (exclude?: string): string[] | undefined => {
  const { code, stdout } = shelljs.exec('git branch', { silent: true })

  if (0 === code)
    return stdout
      .replace(new RegExp(`\\W+|${exclude}`, 'gm'), ' ')
      .trim()
      .split(' ')
}

export const branchExists = (name: string): boolean =>
  noErrorsExec(`git show-ref refs/heads/${name}`)

export const isValidBranchName = (name: string): boolean =>
  noErrorsExec(`git check-ref-format --branch ${name}`)

export const getCurrentBranch = (): string =>
  shelljs.exec('git symbolic-ref --short HEAD', { silent: true }).trim()

export const createBranch = (name: string, ref?: string | false): void => {
  executeOrDie(`git checkout -b ${name}${ref ? ` ${ref}` : ''}`)
}

export const getLatestTag = (): string | undefined => {
  const sstring = shelljs.exec('git describe --abbrev=0', { silent: true })
  return 0 === sstring.code ? sstring.trim() : undefined
}

export const rebase = (onto: string, interactive?: boolean): void => {
  if (process.env.GOF_DRY_RUN)
    log.info('dry-run', `git rebase ${interactive ? '-i ' : ''}${onto}`)
  else if (interactive)
    childProcess.spawnSync('git', ['rebase', '-i', `${onto}`], {
      stdio: 'inherit',
    })
  else executeOrDie(`git rebase ${onto}`)
}

export const checkoutBranch = (branch: string): void => {
  executeOrDie(`git checkout ${branch}`)
}

export const tagBranch = (tag: string, message?: string): void => {
  executeOrDie(`git tag ${message ? `-a -m '${message}' ` : ''}${tag}`)
}

export const mergeBranch = (from: string, strategy?: string): void => {
  executeOrDie(`git merge ${strategy ? `${strategy} ` : ''}${from}`)
}

export const pushToOrigin = (branch: string, tag?: string | boolean): void => {
  executeOrDie(`git push ${tag ? '--follow-tags ' : ''}origin ${branch}`)
}

export const deleteBranch = (branch: string, remote = false): void => {
  executeOrDie(`git ${remote ? 'push origin :' : 'branch -d '}${branch}`)
}

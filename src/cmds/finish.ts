import commander from 'commander'
import * as gofCommand from './gofCommand'
import * as config from '../lib/config'
import * as inquisitor from '../lib/inquisitor'
import * as git from '../lib/git'
import * as log from '../lib/log'

const askTagNameToUser = async (): Promise<string | undefined> => {
  if (config.getConfigValue('tagCommit') === 'true')
    return (
      await inquisitor.promptUser([
        inquisitor.askInput({
          message: `Tag name (latest tag: ${git.getLatestTag()})`,
          name: 'tag',
          validate: (input) =>
            '' !== input.trim() || 'Please, enter a valid tag name',
        }),
      ])
    ).tag
}

const commonOptions: gofCommand.GofCmdOption[] = [
  {
    flags: '-p,--push',
    desc: 'push to origin after merge',
  },
  {
    flags: '--no-push',
    desc: 'do not push',
  },

  {
    flags: '-d,--delete',
    desc: 'delete branch after merge',
  },
  {
    flags: '--no-delete',
    desc: 'do not delete branch',
  },

  {
    flags: '-o,--onto <onto>',
    desc: 'branch to merge or rebase onto',
  },
]

const tagOptions: gofCommand.GofCmdOption[] = [
  {
    flags: '-t,--tag <tagName>',
    desc: 'tag the commit with the given tag',
  },
  {
    flags: '--no-tag',
    desc: 'do not tag the commit',
  },
  {
    flags: '-m,--message <msg>',
    desc: 'annotate tag with a message (default to the tag name)',
  },
]

const maybeUseCurrentBranch = async (): Promise<string | undefined> => {
  const currentBranch = git.getCurrentBranch()
  const useCurrentBranch = await inquisitor.promptUser([
    inquisitor.askConfirmation({
      message: `Use current branch (${currentBranch})?`,
      name: 'confirmation',
    }),
  ])

  if (useCurrentBranch.confirmation) return currentBranch
}

const askBranchNameToUser = async (
  base: string | boolean | undefined,
  cmdName: string
): Promise<string> => {
  const userInput =
    (base ? `${base}/` : '') +
    (
      await inquisitor.promptUser([
        inquisitor.askInput({
          message: `${
            cmdName.charAt(0).toUpperCase() + cmdName.slice(1)
          } name?`,
          name: 'input',
          validate: (name) =>
            name.trim() !== '' || 'Please, enter a valid branch name',
        }),
      ])
    ).input
  git.checkoutBranch(userInput)
  return userInput
}

const maybeCheckoutAndGetBranchName = async (
  cmd: commander.Command,
  arg?: string
): Promise<string> => {
  const base = cmd.base ?? config.getBaseBranch(cmd._name)
  if (arg) {
    const branchName: string = (base ? `${base}/` : '') + arg
    git.checkoutBranch(branchName)
    return branchName
  }

  return (
    (await maybeUseCurrentBranch()) ??
    (await askBranchNameToUser(base, cmd._name))
  )
}

const getTag = async (cmd: commander.Command): Promise<string | false> => {
  const tag: string = cmd.tag ?? (await askTagNameToUser())
  if (tag) git.tagBranch(tag, cmd.message ?? tag)
  else log.warning('commit has not being tagged!')
  return tag
}

const maybeDeleteBranch = async (
  cmdDelete: boolean | undefined,
  branchName: string
): Promise<void> => {
  const del = cmdDelete ?? config.getConfigValue('deleteAfterMerge') === 'true'
  if (del) {
    git.deleteBranch(branchName)
    const ans = await inquisitor.promptUser([
      inquisitor.askConfirmation({
        message: `Delete '${branchName}' from remote?`,
        name: 'confirmation',
      }),
    ])
    if (ans.confirmation) git.deleteBranch(branchName, true)
  }
}

const maybePush = (
  cmdPush: boolean | undefined,
  onto: string,
  tag: string | boolean | undefined
): void => {
  const push = cmdPush ?? config.getConfigValue('pushAfterMerge') === 'true'
  if (push) git.pushToOrigin(onto, tag)
}

const releaseHotfixAction = async (
  arg: string,
  cmd: commander.Command
): Promise<void> => {
  const branchName = await maybeCheckoutAndGetBranchName(cmd, arg)

  const tag = await getTag(cmd)

  const onto =
    cmd.onto ??
    config.getConfigValue('development') ??
    config.getConfigValue('main')

  git.checkoutBranch(onto)

  git.mergeBranch(branchName)

  // const push = cmd.push ?? config.getConfigValue('pushAfterMerge') === 'true'
  // if (push) git.pushToOrigin(onto, tag)
  maybePush(cmd.push, onto, tag)

  await maybeDeleteBranch(cmd.delete, branchName)

  // extra step
  if (
    config.getConfigValue('development') &&
    (
      await inquisitor.promptUser([
        inquisitor.askConfirmation({
          message: `Merge '${tag || branchName}' into '${config.getConfigValue(
            'main'
          )}'?`,
          name: 'confirmation',
        }),
      ])
    ).confirmation
  ) {
    git.checkoutBranch(config.getConfigValue('main') as string)
    git.mergeBranch((tag || branchName) as string, '--ff-only')
  }
}

const release: gofCommand.GofCommand = {
  name: 'release',
  desc: ['finish a release', { name: 'the name of the release to finish' }],
  args: '[name]',
  opts: [...tagOptions, ...commonOptions],
  action: releaseHotfixAction,
  examples: [
    '$ gof finish release 2.3.0',
    "$ git-oneflow f r -t 2.3.0 -m 'chore(release): 2.3.0' my-release",
    '$ gof finish release --no-base --no-push 2.3.0',
  ],
}

const hotfix: gofCommand.GofCommand = {
  name: 'hotfix',
  desc: ['finish a hotfix', { name: 'the name of the hotfix to finish' }],
  args: '[name]',
  opts: [...tagOptions, ...commonOptions],
  action: releaseHotfixAction,
  examples: [
    '$ gof finish hotfix 2.3.1 -b bugs',
    '$ gof f h 2.3.1',
    '$ git-oneflow finish hotfix -o master --no-delete 2.3.1',
  ],
}

const rebaseOptions = [
  { flags: '-i,--interactive', desc: 'interactive rebase' },
  { flags: '--no-interactive', desc: 'do not rebase interactively' },
  { flags: '-s,--strategy <strategy>', desc: 'merge strategy' },
]

const getStrategy = (cmd: commander.Command): string => {
  const strategy = cmd.strategy ?? config.getConfigValue('strategy')
  if (!config.strategyOptionValues.includes(strategy))
    throw new Error(
      `unknown strategy option: '${strategy}'. Valid options are '${config.strategyOptionValues.join(
        ', '
      )}'`
    )
  return strategy
}

const feature: gofCommand.GofCommand = {
  name: 'feature',
  args: '[name]',
  desc: ['finish a feature', { name: 'the feature to finish' }],
  opts: [...commonOptions, ...rebaseOptions],

  examples: [
    '$ git-oneflow finish feature my-feature',
    '$ gof f f -s no-ff',
    '$ gof finish f --dry-run --no-interactive -s rebase-no-ff my-feature',
  ],
  action: async (arg: string, cmd: commander.Command) => {
    const strategy = getStrategy(cmd)

    const branchName = await maybeCheckoutAndGetBranchName(cmd, arg)

    const onto =
      cmd.onto ??
      config.getConfigValue('development') ??
      config.getConfigValue('main')

    if (/^rebase/.test(strategy))
      git.rebase(
        onto,
        cmd.interactive ?? config.getConfigValue('interactive') === 'true'
      )

    git.checkoutBranch(onto)

    if (/no-ff/.test(strategy)) git.mergeBranch(branchName, '--no-ff')
    else git.mergeBranch(branchName, '--ff-only')

    maybePush(cmd.push, onto, false)

    await maybeDeleteBranch(cmd.delete, branchName)
  },
}

export default (): commander.Command =>
  new commander.Command()
    .name('finish')
    .alias('f')
    .description('finish a feature, release or hotfix')
    .addCommand(gofCommand.makeGofCmd(feature))
    .addCommand(gofCommand.makeGofCmd(release))
    .addCommand(gofCommand.makeGofCmd(hotfix))

import { Command } from 'commander'
import * as gofCommand from './gofCommand'
import * as config from '../lib/config'
import * as inquisitor from '../lib/inquisitor'
import * as git from '../lib/git'
import * as log from '../lib/log'

const askTagNameToUser = async (): Promise<string | undefined> => {
  return config.getConfigValue('tagCommit') === 'true'
    ? (
        await inquisitor.promptUser([
          inquisitor.askInput({
            message: `Tag name (latest tag: ${git.getLatestTag()})`,
            name: 'tag',
            validate: (input) =>
              '' !== input.trim() || 'Please, enter a valid tag name',
          }),
        ])
      ).tag
    : undefined
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

const letUserSelectBranch = async (): Promise<string> => {
  return (
    await inquisitor.promptUser([
      inquisitor.presentChoices({
        message: 'Which branch to merge onto?',
        name: 'branch',
        defaultValue: config.optionNames.main,
        choices: () => git.getLocalBranches('feature') as string[],
        when: () => true,
      }),
    ])
  ).branch
}

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
  base: gofCommand.GofOptionsType,
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
  name: string,
  base: string,
  arg?: string
): Promise<string> => {
  const baseBranch = base ?? config.getBaseBranch(name)

  if (arg) {
    const branchName: string = (baseBranch ? `${baseBranch}/` : '') + arg
    git.checkoutBranch(branchName)
    return branchName
  }

  return (
    (await maybeUseCurrentBranch()) ??
    (await askBranchNameToUser(baseBranch, name))
  )
}

const maybeDeleteBranch = async (
  _delete: boolean | undefined,
  branchName: string
): Promise<void> => {
  const doDelete =
    _delete ?? config.getConfigValue('deleteAfterMerge') === 'true'
  if (doDelete) {
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
  push: boolean | undefined,
  onto: string,
  tag: gofCommand.GofOptionsType
): void => {
  const doPush = push ?? config.getConfigValue('pushAfterMerge') === 'true'
  if (doPush) git.pushToOrigin(onto, tag)
}

const releaseHotfixAction = async (
  arg: string,
  opts: Record<string, gofCommand.GofOptionsType>,
  cmd: Command
): Promise<void> => {
  const branchName = await maybeCheckoutAndGetBranchName(
    cmd.name(),
    opts.base as string,
    arg
  )

  const tag = opts.tag ?? (await askTagNameToUser())

  tag
    ? git.tagBranch(tag as string, (opts.message as string) ?? tag)
    : log.warning('commit has not been tagged!')

  const onto =
    opts.onto ??
    config.getConfigValue('development') ??
    config.getConfigValue('main')

  git.checkoutBranch(onto as string)

  git.mergeBranch(branchName)

  maybePush(opts.push as boolean | undefined, onto as string, tag)

  await maybeDeleteBranch(opts.delete as boolean | undefined, branchName)

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
    git.mergeBranch((tag as string) || branchName, '--ff-only')
  }
}

const release: gofCommand.GofCommand = {
  name: 'release',
  desc: 'finish a release',
  args: [{ name: '[name]', desc: 'the name of the release to finish' }],
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
  desc: 'finish a hotfix',
  args: [{ name: '[name]', desc: 'the name of the hotfix to finish' }],
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

const getStrategy = (strategyOpt: config.StrategyOptions): string => {
  const strategy = strategyOpt ?? config.getConfigValue('strategy')
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
  args: [{ name: '[name]', desc: 'the feature to finish' }],
  desc: 'finish a feature',
  opts: [...commonOptions, ...rebaseOptions],

  examples: [
    '$ git-oneflow finish feature my-feature',
    '$ gof f f -s no-ff',
    '$ gof finish f --dry-run --no-interactive -s rebase-no-ff my-feature',
  ],
  action: async (
    arg: string,
    opts: Record<string, gofCommand.GofOptionsType>,
    cmd: Command
  ) => {
    const strategy = getStrategy(opts.strategy as config.StrategyOptions)

    const branchName = await maybeCheckoutAndGetBranchName(
      cmd.name(),
      opts.base as string,
      arg
    )

    const onto =
      opts.onto ??
      (config.getConfigValue('askOnFeatureFinish')
        ? await letUserSelectBranch()
        : config.getConfigValue('development') ?? config.getConfigValue('main'))

    if (/^rebase/.test(strategy))
      git.rebase(
        onto as string,
        (opts.interactive as boolean) ??
          config.getConfigValue('interactive') === 'true'
      )

    git.checkoutBranch(onto as string)

    if (/no-ff/.test(strategy)) git.mergeBranch(branchName, '--no-ff')
    else git.mergeBranch(branchName, '--ff-only')

    maybePush(opts.push as boolean, onto as string, false)

    await maybeDeleteBranch(opts.delete as boolean, branchName)
  },
}

export default (): Command =>
  new Command()
    .name('finish')
    .alias('f')
    .description('finish a feature, release or hotfix')
    .addCommand(gofCommand.makeGofCmd(feature))
    .addCommand(gofCommand.makeGofCmd(release))
    .addCommand(gofCommand.makeGofCmd(hotfix))

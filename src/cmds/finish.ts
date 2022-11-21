import { Command } from 'commander'
import {
  GofCmdOption,
  GofOptionsType,
  GofCommand,
  makeGofCmd,
} from './gofCommand'
import {
  getConfigValue,
  optionNames,
  getBaseBranch,
  StrategyOptions,
  strategyOptionValues,
} from '../lib/config'
import {
  promptUser,
  askInput,
  presentChoices,
  askConfirmation,
} from '../lib/inquisitor'
import {
  getLatestTag,
  getLocalBranches,
  getCurrentBranch,
  checkoutBranch,
  deleteBranch,
  pushToOrigin,
  tagBranch,
  mergeBranch,
  rebase,
} from '../lib/git'
import { warning } from '../lib/log'

const askTagNameToUser = async (): Promise<string | undefined> => {
  return getConfigValue('tagCommit') === 'true'
    ? (
        await promptUser([
          askInput({
            message: `Tag name (latest tag: ${getLatestTag()})`,
            name: 'tag',
            validate: (input) =>
              '' !== input.trim() || 'Please, enter a valid tag name',
          }),
        ])
      ).tag
    : undefined
}

const commonOptions: GofCmdOption[] = [
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

const tagOptions: GofCmdOption[] = [
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
    await promptUser([
      presentChoices({
        message: 'Which branch to merge onto?',
        name: 'branch',
        defaultValue: optionNames.main,
        choices: () => getLocalBranches('feature') as string[],
        when: () => true,
      }),
    ])
  ).branch
}

const maybeUseCurrentBranch = async (): Promise<string | undefined> => {
  const currentBranch = getCurrentBranch()
  const useCurrentBranch = await promptUser([
    askConfirmation({
      message: `Use current branch (${currentBranch})?`,
      name: 'confirmation',
    }),
  ])

  if (useCurrentBranch.confirmation) return currentBranch
}

const askBranchNameToUser = async (
  base: GofOptionsType,
  cmdName: string
): Promise<string> => {
  const userInput =
    (base ? `${base}/` : '') +
    (
      await promptUser([
        askInput({
          message: `${
            cmdName.charAt(0).toUpperCase() + cmdName.slice(1)
          } name?`,
          name: 'input',
          validate: (name) =>
            name.trim() !== '' || 'Please, enter a valid branch name',
        }),
      ])
    ).input
  checkoutBranch(userInput)
  return userInput
}

const maybeCheckoutAndGetBranchName = async (
  name: string,
  base: string,
  arg?: string
): Promise<string> => {
  const baseBranch = base ?? getBaseBranch(name)

  if (arg) {
    const branchName: string = (baseBranch ? `${baseBranch}/` : '') + arg
    checkoutBranch(branchName)
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
  const doDelete = _delete ?? getConfigValue('deleteAfterMerge') === 'true'
  if (doDelete) {
    deleteBranch(branchName)
    const ans = await promptUser([
      askConfirmation({
        message: `Delete '${branchName}' from remote?`,
        name: 'confirmation',
      }),
    ])
    if (ans.confirmation) deleteBranch(branchName, true)
  }
}

const maybePush = (
  push: boolean | undefined,
  onto: string,
  tag: GofOptionsType
): void => {
  const doPush = push ?? getConfigValue('pushAfterMerge') === 'true'
  if (doPush) pushToOrigin(onto, tag)
}

const releaseHotfixAction = async (
  arg: string,
  opts: Record<string, GofOptionsType>,
  cmd: Command
): Promise<void> => {
  const branchName = await maybeCheckoutAndGetBranchName(
    cmd.name(),
    opts.base as string,
    arg
  )

  const tag = opts.tag ?? (await askTagNameToUser())

  tag
    ? tagBranch(tag as string, (opts.message as string) ?? tag)
    : warning('commit has not been tagged!')

  const onto =
    opts.onto ?? getConfigValue('development') ?? getConfigValue('main')

  checkoutBranch(onto as string)

  mergeBranch(branchName)

  maybePush(opts.push as boolean | undefined, onto as string, tag)

  await maybeDeleteBranch(opts.delete as boolean | undefined, branchName)

  // extra step
  if (
    getConfigValue('development') &&
    (
      await promptUser([
        askConfirmation({
          message: `Merge '${tag || branchName}' into '${getConfigValue(
            'main'
          )}'?`,
          name: 'confirmation',
        }),
      ])
    ).confirmation
  ) {
    checkoutBranch(getConfigValue('main') as string)
    mergeBranch((tag as string) || branchName, '--ff-only')
  }
}

const release: GofCommand = {
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

const hotfix: GofCommand = {
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

const getStrategy = (strategyOpt: StrategyOptions): string => {
  const strategy = strategyOpt ?? getConfigValue('strategy')
  if (!strategyOptionValues.includes(strategy))
    throw new Error(
      `unknown strategy option: '${strategy}'. Valid options are '${strategyOptionValues.join(
        ', '
      )}'`
    )
  return strategy
}

const feature: GofCommand = {
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
    opts: Record<string, GofOptionsType>,
    cmd: Command
  ) => {
    const strategy = getStrategy(opts.strategy as StrategyOptions)

    const branchName = await maybeCheckoutAndGetBranchName(
      cmd.name(),
      opts.base as string,
      arg
    )

    const onto =
      opts.onto ??
      (getConfigValue('askOnFeatureFinish')
        ? await letUserSelectBranch()
        : getConfigValue('development') ?? getConfigValue('main'))

    if (/^rebase/.test(strategy))
      rebase(
        onto as string,
        (opts.interactive as boolean) ??
          getConfigValue('interactive') === 'true'
      )

    checkoutBranch(onto as string)

    if (/no-ff/.test(strategy)) mergeBranch(branchName, '--no-ff')
    else mergeBranch(branchName, '--ff-only')

    maybePush(opts.push as boolean, onto as string, false)

    await maybeDeleteBranch(opts.delete as boolean, branchName)
  },
}

export default (): Command =>
  new Command()
    .name('finish')
    .alias('f')
    .description('finish a feature, release or hotfix')
    .addCommand(makeGofCmd(feature))
    .addCommand(makeGofCmd(release))
    .addCommand(makeGofCmd(hotfix))

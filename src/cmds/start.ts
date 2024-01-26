import { Command } from 'commander'
import { getConfigValue, optionNames, getBaseBranch } from '../lib/config'
import { getLatestTag, getLocalBranches, createBranch } from '../lib/git'
import {
  GofOptionsType,
  GofCmdOption,
  GofCommand,
  makeGofCmd,
} from './gofCommand'
import { promptUser, presentChoices, askInput } from '../lib/inquisitor'

const getDefaultReference = async (
  cmdName: string,
): Promise<string | undefined> => {
  switch (cmdName) {
    case 'feature':
      return getConfigValue('askOnFeatureStart')
        ? await letUserSelectBranch()
        : getConfigValue('development') ?? getConfigValue('main')
    case 'release':
      return getConfigValue('main')
    case 'hotfix':
      return getLatestTag() ?? getConfigValue('main')
  }
}

const letUserSelectBranch = async (): Promise<string> => {
  const userInput = await promptUser([
    presentChoices({
      message: 'Which branch to start from?',
      name: 'branch',
      defaultValue: optionNames.main,
      choices: () => getLocalBranches('feature') as string[],
      when: () => true,
    }),
  ])
  return userInput.branch
}

const cmdAction = async (
  arg: string,
  opts: Record<string, GofOptionsType>,
  cmd: Command,
): Promise<void> => {
  const name =
    arg ??
    (
      await promptUser([
        askInput({
          message: `${
            cmd.name().charAt(0).toUpperCase() + cmd.name().slice(1)
          } name?`,
          name: 'branchName',
          validate: (input) =>
            input.trim() !== '' || 'Please, enter a valid branch name',
        }),
      ])
    ).branchName

  const base = opts.base ?? getBaseBranch(cmd.name())

  const ref =
    opts.ref ??
    (getConfigValue('askOnFeatureStart')
      ? await letUserSelectBranch()
      : await getDefaultReference(cmd.name()))

  createBranch(base ? `${base}/${name}` : name, ref)
}

const commonOptions: GofCmdOption[] = [
  {
    flags: '-r, --ref <ref>',
    desc: 'new branch will be created from the given branch, commit or tag',
  },
  {
    flags: '--no-ref',
    desc: 'create the new branch from the current branch',
  },
]

const feature: GofCommand = {
  name: 'feature',
  args: [
    {
      name: '[name]',
      desc: 'the name of the feature (without the base branch name)',
    },
  ],
  opts: commonOptions,
  desc: 'start a new feature from the main or the development branch',
  action: cmdAction,
  examples: [
    '$ git-oneflow start feature my-feature',
    '$ gof s f -b feat my-feature',
    '$ gof start feature --dry-run --ref some-branch my-feature',
  ],
}

const release: GofCommand = {
  name: 'release',
  args: [
    {
      name: '[name]',
      desc: 'the name of the release branch (without the base branch name)',
    },
  ],
  opts: commonOptions,
  desc: 'start a new release from the main branch',
  action: cmdAction,
  examples: [
    '$ gof start release 2.3.0',
    '$ git-oneflow s r -r release-branch 2.3.0',
    '$ gof start release --no-base --ref 9efc5d 2.3.0',
  ],
}

const hotfix: GofCommand = {
  name: 'hotfix',
  args: [
    {
      name: '[name]',
      desc: 'the name of the hotfix (without the base branch name)',
    },
  ],
  opts: commonOptions,
  desc: 'start a new hotfix from the latest tag (if exists) or the main branch',
  action: cmdAction,
  examples: [
    '$ gof start hotfix 2.3.1 -b bugs',
    '$ gof s h 2.3.1',
    '$ git-oneflow start hotfix -r main --no-base 2.3.1',
  ],
}

export default (): Command =>
  new Command()
    .name('start')
    .alias('s')
    .description('start a new feature, release or hotfix')
    .addCommand(makeGofCmd(feature))
    .addCommand(makeGofCmd(release))
    .addCommand(makeGofCmd(hotfix))

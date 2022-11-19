import { Command } from 'commander'
import * as config from '../lib/config'
import * as git from '../lib/git'
import * as gofCommand from './gofCommand'
import * as inquisitor from '../lib/inquisitor'

const getDefaultReference = async (
  cmdName: string
): Promise<string | undefined> => {
  switch (cmdName) {
    case 'feature':
      return config.getConfigValue('askOnFeatureStart')
        ? await letUserSelectBranch()
        : config.getConfigValue('development') ?? config.getConfigValue('main')
    case 'release':
      return config.getConfigValue('main')
    case 'hotfix':
      return git.getLatestTag() ?? config.getConfigValue('main')
  }
}

const letUserSelectBranch = async (): Promise<string> => {
  const userInput = await inquisitor.promptUser([
    inquisitor.presentChoices({
      message: 'Which branch to start from?',
      name: 'branch',
      defaultValue: config.optionNames.main,
      choices: () => git.getLocalBranches('feature') as string[],
      when: () => true,
    }),
  ])
  return userInput.branch
}

const cmdAction = async (
  arg: string,
  opts: Record<string, gofCommand.GofOptionsType>,
  cmd: Command
): Promise<void> => {
  const name =
    arg ??
    (
      await inquisitor.promptUser([
        inquisitor.askInput({
          message: `${
            cmd.name().charAt(0).toUpperCase() + cmd.name().slice(1)
          } name?`,
          name: 'branchName',
          validate: (input) =>
            input.trim() !== '' || 'Please, enter a valid branch name',
        }),
      ])
    ).branchName

  const base = opts.base ?? config.getBaseBranch(cmd.name())

  const ref =
    opts.ref ??
    (config.getConfigValue('askOnFeatureStart')
      ? await letUserSelectBranch()
      : await getDefaultReference(cmd.name()))

  git.createBranch(base ? `${base}/${name}` : name, ref)
}

const commonOptions: gofCommand.GofCmdOption[] = [
  {
    flags: '-r, --ref <ref>',
    desc: 'new branch will be created from the given branch, commit or tag',
  },
  {
    flags: '--no-ref',
    desc: 'create the new branch from the current branch',
  },
]

const feature: gofCommand.GofCommand = {
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

const release: gofCommand.GofCommand = {
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

const hotfix: gofCommand.GofCommand = {
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
    '$ git-oneflow start hotfix -r master --no-base 2.3.1',
  ],
}

export default (): Command =>
  new Command()
    .name('start')
    .alias('s')
    .description('start a new feature, release or hotfix')
    .addCommand(gofCommand.makeGofCmd(feature))
    .addCommand(gofCommand.makeGofCmd(release))
    .addCommand(gofCommand.makeGofCmd(hotfix))

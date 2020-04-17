import commander from 'commander'
import * as config from '../lib/config'
import * as git from '../lib/git'
import * as gofCommand from './gofCommand'
import * as inquisitor from '../lib/inquisitor'

const getDefaultReference = (cmdName: string): string | undefined => {
  switch (cmdName) {
    case 'feature':
      return (
        config.getConfigValue('development') ?? config.getConfigValue('main')
      )
    case 'release':
      return config.getConfigValue('main')
    case 'hotfix':
      return git.getLatestTag() ?? config.getConfigValue('main')
  }
}

const cmdAction = async (
  arg: string,
  cmd: commander.Command
): Promise<void> => {
  const name =
    arg ??
    (
      await inquisitor.promptUser([
        inquisitor.askInput({
          message: `${
            cmd._name.charAt(0).toUpperCase() + cmd._name.slice(1)
          } name?`,
          name: 'branchName',
          validate: (input) =>
            input.trim() !== '' || 'Please, enter a valid branch name',
        }),
      ])
    ).branchName

  const base = cmd.base ?? config.getBaseBranch(cmd._name)

  const ref = cmd.ref ?? getDefaultReference(cmd._name)

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
  args: '[name]',
  opts: commonOptions,
  desc: [
    'start a new feature from the main or the development branch',
    { name: 'the name of the feature (without the base branch name)' },
  ],
  action: cmdAction,
  examples: [
    '$ git-oneflow start feature my-feature',
    '$ gof s f -b feat my-feature',
    '$ gof start feature --dry-run --ref some-branch my-feature',
  ],
}

const release: gofCommand.GofCommand = {
  name: 'release',
  args: '[name]',
  opts: commonOptions,
  desc: [
    'start a new release from the main branch',
    { name: 'the name of the release branch (without the base branch name)' },
  ],
  action: cmdAction,
  examples: [
    '$ gof start release 2.3.0',
    '$ git-oneflow s r -r release-branch 2.3.0',
    '$ gof start release --no-base --ref 9efc5d 2.3.0',
  ],
}

const hotfix: gofCommand.GofCommand = {
  name: 'hotfix',
  args: '[name]',
  opts: commonOptions,
  desc: [
    'start a new hotfix from the latest tag (if exists) or the main branch',
    { name: 'the name of the hotfix (without the base branch name)' },
  ],
  action: cmdAction,
  examples: [
    '$ gof start hotfix 2.3.1 -b bugs',
    '$ gof s h 2.3.1',
    '$ git-oneflow start hotfix -r master --no-base 2.3.1',
  ],
}

export default (): commander.Command =>
  new commander.Command()
    .name('start')
    .alias('s')
    .description('start a new feature, release or hotfix')
    .addCommand(gofCommand.makeGofCmd(feature))
    .addCommand(gofCommand.makeGofCmd(release))
    .addCommand(gofCommand.makeGofCmd(hotfix))

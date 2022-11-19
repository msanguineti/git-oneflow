import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import * as pkg from '../../package.json'
import * as config from '../lib/config'
import * as log from '../lib/log'
import * as inquisitor from '../lib/inquisitor'
import yoda from '../lib/yoda'
import * as git from '../lib/git'

const configInitQuestions = (): inquisitor.GofQuestion[] => [
  inquisitor.presentChoices({
    message: 'Main branch name?',
    name: config.optionNames.main,
    choices: git.getLocalBranches() as string[],
    defaultValue: config.getConfigValue('main'),
  }),
  inquisitor.askConfirmation({
    message: 'Do you use a development branch?',
    name: 'useDevelop',
    defaultValue: config.getConfigValue('development') !== undefined,
    when: (answers) =>
      undefined !== git.getLocalBranches(answers[config.optionNames.main]),
  }),
  inquisitor.presentChoices({
    message: 'Development branch name?',
    name: config.optionNames.development,
    choices: (answers) =>
      git.getLocalBranches(answers[config.optionNames.main]) as string[],
    when: (answers) => answers.useDevelop === true,
  }),
  inquisitor.askInput({
    message: 'Features branch basename?',
    name: config.optionNames.features,
    defaultValue:
      config.getConfigValue('features') ?? config.getDefaultValue('features'),
    validate: (input) =>
      input.trim() === '' ||
      git.isValidBranchName(input) ||
      'Please, enter a valid branch name',
  }),
  inquisitor.askInput({
    message: 'Releases branch basename?',
    name: config.optionNames.releases,
    defaultValue:
      config.getConfigValue('releases') ?? config.getDefaultValue('releases'),
    validate: (input) =>
      input.trim() === '' ||
      git.isValidBranchName(input) ||
      'Please, enter a valid branch name',
  }),
  inquisitor.askInput({
    message: 'Hotfixes branch basename?',
    name: config.optionNames.hotfixes,
    defaultValue:
      config.getConfigValue('hotfixes') ?? config.getDefaultValue('hotfixes'),
    validate: (input) =>
      input.trim() === '' ||
      git.isValidBranchName(input) ||
      'Please, enter a valid branch name',
  }),
  inquisitor.presentChoices({
    message: 'Merge strategy to use?',
    name: config.optionNames.strategy,
    choices: config.strategyOptionValues,
    defaultValue: config.getConfigValue('strategy'),
  }),
  inquisitor.askConfirmation({
    message: 'Always rebase interactively?',
    name: config.optionNames.interactive,
    defaultValue: config.getConfigValue('interactive') === 'true',
  }),
  inquisitor.askConfirmation({
    message: 'Push to origin after merge?',
    name: config.optionNames.pushAfterMerge,
    defaultValue: config.getConfigValue('pushAfterMerge') === 'true',
  }),
  inquisitor.askConfirmation({
    message: 'Delete branch after merge?',
    name: config.optionNames.deleteAfterMerge,
    defaultValue: config.getConfigValue('deleteAfterMerge') === 'true',
  }),
  inquisitor.askConfirmation({
    message: 'Tag releases and hotfixes?',
    name: config.optionNames.tagCommit,
    defaultValue: config.getConfigValue('tagCommit') === 'true',
  }),
  inquisitor.askConfirmation({
    message: 'Ask for ref branch on feature start?',
    name: config.optionNames.askOnFeatureStart,
    defaultValue: config.getConfigValue('askOnFeatureStart') === 'true',
  }),
  inquisitor.askConfirmation({
    message: 'Ask for merge branch on feature finish?',
    name: config.optionNames.askOnFeatureFinish,
    defaultValue: config.getConfigValue('askOnFeatureFinish') === 'true',
  }),
]

const maybePromptUser = async (defaults?: boolean): Promise<string> => {
  if (defaults) return JSON.stringify(config.defaultConfiguration, null, 2)

  const ans = await inquisitor.promptUser(configInitQuestions())
  delete ans.useDevelop
  return JSON.stringify(ans, null, 2)
}

const maybeUseTheForce = (force?: boolean): void => {
  const oldConfFile = config.getConfigFile()

  if (!oldConfFile) return

  if (!force) {
    log.warning(
      `a configuration exists at '${oldConfFile}'. Cowardly refusing to proceed!`
    )
    process.exit(0)
  }
  log.info('Use the Force, Luke', yoda)
  log.warning(`option '-f,--force' detected. Using the force...`)
}

const writeConfigFile = (values: string): void => {
  const filePath = path.resolve(process.cwd(), `.${pkg.name}rc`)
  fs.writeFileSync(filePath, values)
  log.info('config', `new configuration file created at '${filePath}'`)
}

export default (): Command =>
  new Command('init')
    .description('initialise configuration file')
    .option('-y, --defaults', 'accept all defaults')
    .option('-f, --force', 'force creation of configuration file')
    .action(async (cmd: Command & { force: boolean; defaults: boolean }) => {
      maybeUseTheForce(cmd.force)
      writeConfigFile(await maybePromptUser(cmd.defaults))
    })

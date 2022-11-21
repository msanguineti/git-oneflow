import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import { name } from '../../package.json'
import {
  optionNames,
  getConfigValue,
  getDefaultValue,
  strategyOptionValues,
  defaultConfiguration,
  getConfigFile,
} from '../lib/config'
import { warning, info } from '../lib/log'
import {
  GofQuestion,
  presentChoices,
  askConfirmation,
  askInput,
  promptUser,
} from '../lib/inquisitor'
import yoda from '../lib/yoda'
import { getLocalBranches, isValidBranchName } from '../lib/git'

const configInitQuestions = (): GofQuestion[] => [
  presentChoices({
    message: 'Main branch name?',
    name: optionNames.main,
    choices: getLocalBranches() as string[],
    defaultValue: getConfigValue('main'),
  }),
  askConfirmation({
    message: 'Do you use a development branch?',
    name: 'useDevelop',
    defaultValue: getConfigValue('development') !== undefined,
    when: (answers) =>
      undefined !== getLocalBranches(answers[optionNames.main]),
  }),
  presentChoices({
    message: 'Development branch name?',
    name: optionNames.development,
    choices: (answers) =>
      getLocalBranches(answers[optionNames.main]) as string[],
    when: (answers) => answers.useDevelop === true,
  }),
  askInput({
    message: 'Features branch basename?',
    name: optionNames.features,
    defaultValue: getConfigValue('features') ?? getDefaultValue('features'),
    validate: (input) =>
      input.trim() === '' ||
      isValidBranchName(input) ||
      'Please, enter a valid branch name',
  }),
  askInput({
    message: 'Releases branch basename?',
    name: optionNames.releases,
    defaultValue: getConfigValue('releases') ?? getDefaultValue('releases'),
    validate: (input) =>
      input.trim() === '' ||
      isValidBranchName(input) ||
      'Please, enter a valid branch name',
  }),
  askInput({
    message: 'Hotfixes branch basename?',
    name: optionNames.hotfixes,
    defaultValue: getConfigValue('hotfixes') ?? getDefaultValue('hotfixes'),
    validate: (input) =>
      input.trim() === '' ||
      isValidBranchName(input) ||
      'Please, enter a valid branch name',
  }),
  presentChoices({
    message: 'Merge strategy to use?',
    name: optionNames.strategy,
    choices: strategyOptionValues,
    defaultValue: getConfigValue('strategy'),
  }),
  askConfirmation({
    message: 'Always rebase interactively?',
    name: optionNames.interactive,
    defaultValue: getConfigValue('interactive') === 'true',
  }),
  askConfirmation({
    message: 'Push to origin after merge?',
    name: optionNames.pushAfterMerge,
    defaultValue: getConfigValue('pushAfterMerge') === 'true',
  }),
  askConfirmation({
    message: 'Delete branch after merge?',
    name: optionNames.deleteAfterMerge,
    defaultValue: getConfigValue('deleteAfterMerge') === 'true',
  }),
  askConfirmation({
    message: 'Tag releases and hotfixes?',
    name: optionNames.tagCommit,
    defaultValue: getConfigValue('tagCommit') === 'true',
  }),
  askConfirmation({
    message: 'Ask for ref branch on feature start?',
    name: optionNames.askOnFeatureStart,
    defaultValue: getConfigValue('askOnFeatureStart') === 'true',
  }),
  askConfirmation({
    message: 'Ask for merge branch on feature finish?',
    name: optionNames.askOnFeatureFinish,
    defaultValue: getConfigValue('askOnFeatureFinish') === 'true',
  }),
]

const maybePromptUser = async (defaults?: boolean): Promise<string> => {
  if (defaults) return JSON.stringify(defaultConfiguration, null, 2)

  const ans = await promptUser(configInitQuestions())
  delete ans.useDevelop
  return JSON.stringify(ans, null, 2)
}

const maybeUseTheForce = (force?: boolean): void => {
  const oldConfFile = getConfigFile()

  if (!oldConfFile) return

  if (!force) {
    warning(
      `a configuration exists at '${oldConfFile}'. Cowardly refusing to proceed!`
    )
    process.exit(0)
  }
  info('Use the Force, Luke', yoda)
  warning(`option '-f,--force' detected. Using the force...`)
}

const writeConfigFile = (values: string): void => {
  const filePath = path.resolve(process.cwd(), `.${name}rc`)
  fs.writeFileSync(filePath, values)
  info('config', `new configuration file created at '${filePath}'`)
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

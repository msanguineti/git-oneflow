import commander, { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import * as packageJson from '../../package.json'
import * as config from '../lib/config'
import * as log from '../lib/log'
import * as prompt from '../lib/prompt'
import yoda from '../lib/yoda'
import * as inquirer from 'inquirer'

const getQuestions = (): (
  | inquirer.InputQuestion<inquirer.Answers>
  | inquirer.ConfirmQuestion<inquirer.Answers>
  | inquirer.ListQuestion<inquirer.Answers>
)[] => [
  prompt.askInput({
    message: 'Main branch name?',
    name: config.optionNames.main,
    defaultValues: config.getDefaultValue('main'),
    validate: (input) => {
      if (input.trim() !== '') return true
      else return 'Main branch name cannot be an empty string'
    },
  }),
  prompt.askConfirmation({
    message: 'Do you use a development branch?',
    name: 'useDevelop',
    defaultValue: false,
  }),
  prompt.askInput({
    message: 'Development branch name?',
    name: config.optionNames.development,
    defaultValues: 'develop',
    when: (answers) => {
      return answers.useDevelop === true
    },
    validate: (input) => {
      if (input.trim() !== '') return true
      else return 'Please, enter a name for the development branch'
    },
  }),
  prompt.askInput({
    message: 'Features branch basename?',
    name: config.optionNames.featuresBranch,
    defaultValues: config.getDefaultValue('featuresBranch'),
  }),
  prompt.askInput({
    message: 'Releases branch basename?',
    name: config.optionNames.releasesBranch,
    defaultValues: config.getDefaultValue('releasesBranch'),
  }),
  prompt.askInput({
    message: 'Hotfixes branch basename?',
    name: config.optionNames.hotfixesBranch,
    defaultValues: config.getDefaultValue('hotfixesBranch'),
  }),
  prompt.presentChoices({
    message: 'Merge strategy to use?',
    name: config.optionNames.strategy,
    choices: config.strategyOptionValues,
  }),
  prompt.askConfirmation({
    message: 'Always rebase interactively?',
    name: config.optionNames.interactive,
  }),
  prompt.askConfirmation({
    message: 'Push to origin after merge?',
    name: config.optionNames.pushAfterMerge,
  }),
  prompt.askConfirmation({
    message: 'Delete branch after merge?',
    name: config.optionNames.deleteAfterMerge,
  }),
]

const maybePromptUser = async (defaults?: boolean): Promise<string> => {
  if (defaults) return JSON.stringify(config.defaultConfiguration, null, 2)

  const ans = await prompt.promptUser(getQuestions())
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
  const filePath = path.resolve(process.cwd(), `.${packageJson.name}rc`)
  fs.writeFileSync(filePath, values)
  log.info('config', `new configuration file created at '${filePath}'`)
}

export default (): commander.Command =>
  new commander.Command('init')
    .description('initialise configuration file')
    .option('-y, --defaults', 'accept all defaults')
    .option('-f, --force', 'force creation of configuration file')
    .action(async (cmd: Command) => {
      maybeUseTheForce(cmd.force)
      writeConfigFile(await maybePromptUser(cmd.defaults))
    })

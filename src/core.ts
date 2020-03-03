/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import findUp from 'find-up'
import { extname } from 'path'
import { exec, sed, ShellString, test } from 'shelljs'
import { error, info } from './utils/text'

export type ConfigValues = { [key: string]: string | number | boolean }

const defaultConfigValues: ConfigValues = {
  delete: 'always',
  development: 'develop',
  feature: 'feature',
  hotfix: 'hotfix',
  integration: 1,
  interactive: 'always',
  main: 'master',
  push: 'always',
  release: 'release',
  tags: true,
  usedev: false
}

const validateMultipleChoiceOption = (element: string, key: string): void => {
  if (typeof element !== 'string' || !element.match(/^(ask|always|never)$/)) {
    throw new Error(
      `${info(
        key
      )} has to be either 'ask', 'always' or 'never'. Value found: ${error(
        element
      )}`
    )
  }
}

const validateIntegrationOption = (element: number, key: string): void => {
  if (typeof element !== 'number' || element < 1 || element > 3) {
    throw new Error(
      `${info(key)} has to be a number >=1 and <=3. Value found: ${error(
        element
      )}`
    )
  }
}

const validateBooleanOption = (element: boolean, key: string): void => {
  if (typeof element !== 'boolean') {
    throw new Error(
      `${info(key)} has to be either 'true' or 'false'. Value found: ${error(
        element
      )}`
    )
  }
}

const checkGitRefFormat = (value: string): boolean => {
  return (
    exec(`git check-ref-format "${value}"`, {
      silent: true
    }).code === 0
  )
}

export const isValidBranchName = (branchName: string | unknown): boolean => {
  return checkGitRefFormat(`refs/heads/${branchName}`)
}

const validateBranchName = (element: string, key: string): void => {
  if (!isValidBranchName(element)) {
    throw new Error(
      `${info(key)} branch name is invalid. Value found: ${error(element)}`
    )
  }
}

const sanityCheck = (configValues: ConfigValues): boolean => {
  for (const key in configValues) {
    if (Object.prototype.hasOwnProperty.call(configValues, key)) {
      const element = configValues[key]
      switch (key) {
        case 'main':
        case 'development':
        case 'hotfix':
        case 'release':
        case 'feature':
          validateBranchName(element as string, key)
          break
        case 'usedev':
          validateBooleanOption(element as boolean, key)
          break
        case 'integration':
          validateIntegrationOption(element as number, key)
          break
        case 'interactive':
        case 'push':
        case 'delete':
          validateMultipleChoiceOption(element as string, key)
          break
        case 'tags':
          validateBooleanOption(element as boolean, key)
          break
        default:
          throw new Error(`Unknown option ${error(key)} found in configuration`)
      }
    }
  }
  return true
}

const defaultConfigFileName = 'gof.config.js'

const defaultConfigFileNames: string[] = [
  defaultConfigFileName,
  '.gofrc.js',
  '.gofrc'
]

// const supportedExtensions = ['.js', '.json']

const getCommentFor = (key: string): string => {
  switch (key) {
    case 'main': {
      return 'Main (production) branch name. Default `master`'
    }
    case 'usedev': {
      return 'Use development branch? Default `false`'
    }
    case 'development': {
      return 'Development branch name. Default `develop`'
    }
    case 'release': {
      return 'Release branch name. Default: `release`'
    }
    case 'hotfix': {
      return 'Hotfix branch name. Default: `hotfix`'
    }
    case 'feature': {
      return 'Feature branch name. Default: `feature`'
    }
    case 'integration': {
      return 'Integration method to use (see https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow#feature-branches). Options: [`1`, `2`, `3`]. Default: `1`.'
    }
    case 'interactive': {
      return 'Use interactve rebase (`git rebase -i` only valid for integration === 1 || 3)? Options: [`always`, `never`, `ask`]. Default: `always`.'
    }
    case 'push': {
      return 'Push to origin after finishing feature/hotfix/release? Options: [`always`, `never`, `ask`]. Default: `always`.'
    }
    case 'delete': {
      return 'Delete the working branch (feature/hotfix/release) after merging with main/development? Options: [`always`, `never`, `ask`]. Default: `always`.'
    }
    case 'tags': {
      return 'Automatic tag releases and hotfixes (based on user input, e.g. release/0.2.0 => tag = 0.2.0. Default: `true`'
    }
    default: {
      return ''
    }
  }
}

const getFileExt = (configFile: string): string => {
  return extname(configFile)
}

const generateCommentedValues = (configValues: ConfigValues): string[] => {
  const output: string[] = []
  for (const key in configValues) {
    if (Object.prototype.hasOwnProperty.call(configValues, key)) {
      const element =
        typeof configValues[key] === 'string'
          ? `"${configValues[key]}"`
          : configValues[key]
      output.push(`\t/** ${getCommentFor(key)} */\n\t${key}: ${element},`)
    }
  }
  return output
}

/**
 * Returns the default config values of the application
 *
 * `main`: name of the main (production) branch (default `master`)
 *
 * `usedev`: whether to use a development branch (default `false`)
 *
 * `development`: the name of the development branch (default: `develop`)
 *
 * `feature`: name of the features branch (default `feature`)
 *
 * `release`: name of the releases branch (default `release`)
 *
 * `hotfix`: name of the hotfixes branch (default `hotfix`)
 *
 * `integration`: which integration strategy to use (default #`1`)
 *
 * `interactive`: whether to rebase interactively (default `always`, can also be `never` or `ask`)
 *
 * `push`: whether to push to origin after finishing (default `always`, can also be `never` or `ask`)
 *
 * `delete`: whether to delete the branch after merging with main/development (default `always`, can also be `never` or `ask`)
 *
 * `tags`: whether to automatically tag releases and hotfixes (default: `true`)
 *
 * @returns {ConfigValues} the default config values
 */
export const getDefaultConfigValues = (): ConfigValues => {
  return { ...defaultConfigValues }
}

/**
 * Load a specific configuration file
 *
 * @param configFile name of configuration file to load
 * @returns {ConfigValues} the loaded config values
 */
export const loadConfigFile = (configFile?: string): ConfigValues => {
  if (!configFile || !test('-f', configFile)) {
    throw new Error(
      `Cannot load configuration values from: ${info(configFile)}`
    )
  }

  const configValues =
    getFileExt(configFile) === '.js'
      ? require(configFile)
      : JSON.parse(sed(/(\/\*[\w\W]+\*\/|(\/\/.*))/g, '', configFile))

  sanityCheck(configValues)
  return { ...defaultConfigValues, ...configValues }
}

/**
 * Tries to load configuration files defined in a file
 *
 * @returns {ConfigValues} config values loaded from a file or default configuration values if there's no file.
 */
export const loadConfigValues = (): ConfigValues => {
  const configFile = findUp.sync(defaultConfigFileNames)

  return configFile ? loadConfigFile(configFile) : defaultConfigValues
}

/**
 * Writes configuration values to a file.
 *
 * @param file the file name to save configuration values to
 * @param data the configuration values
 * @returns {boolean} `true` if the config file was created, `false` otherwise.
 */
export const writeConfigFile = ({
  file = defaultConfigFileName,
  data = defaultConfigValues
}: {
  file?: string
  data?: ConfigValues
}): boolean => {
  let toWrite: string

  sanityCheck(data)

  switch (getFileExt(file)) {
    case '.js':
      toWrite = [
        'module.exports = {',
        ...generateCommentedValues(data),
        '}'
      ].join('\n')
      break
    case '.json':
      toWrite = JSON.stringify(data, null, 2)
      break
    default: {
      // console.error(
      //   error(
      //     `Cannot write to ${file}. Supported extensions: ${supportedExtensions}`
      //   )
      // )
      return false
    }
  }

  ShellString(toWrite).to(file)
  // console.log(`Values written to: ${info(file)}`)
  return true
}

export const isValidTagName = (tagName: string): boolean => {
  return checkGitRefFormat(`refs/tags/${tagName}`)
}

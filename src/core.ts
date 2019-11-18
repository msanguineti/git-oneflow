/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import findUp from 'find-up'
import { extname } from 'path'
import { exec, sed, ShellString, test } from 'shelljs'

export type ConfigValues = { [key: string]: string | number | boolean }

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
    throw new Error(`Cannot load configuration values from: ${configFile}`)
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
  const configFile = findUp.sync(defaultConfigFileNames) || undefined

  if (!configFile) return defaultConfigValues

  return loadConfigFile(configFile)
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

export const isValidBranchName = (branchName: string | unknown): boolean => {
  return checkGitRefFormat(`refs/heads/${branchName}`)
}

export const isValidTagName = (tagName: string): boolean => {
  return checkGitRefFormat(`refs/tags/${tagName}`)
}

const sanityCheck = (configValues: ConfigValues): boolean => {
  for (const key in configValues) {
    if (configValues.hasOwnProperty(key)) {
      const element = configValues[key]
      switch (key) {
        case 'main':
        case 'development':
        case 'hotfix':
        case 'release':
        case 'feature':
          if (!isValidBranchName(element)) {
            throw new Error(
              `${key} branch name is invalid. Value found: ${element}`
            )
          }
          break
        case 'usedev':
          if (typeof element !== 'boolean') {
            throw new Error(
              `${key} has to be either 'true' or 'false'. Value found: ${element}`
            )
          }
          break
        case 'integration':
          if (typeof element !== 'number' || (element < 1 || element > 3)) {
            throw new Error(
              `${key} has to be a number >=1 and <=3. Value found: ${element}`
            )
          }
          break
        case 'interactive':
        case 'push':
        case 'delete':
          if (
            typeof element !== 'string' ||
            !element.match(/(ask|always|never)/)
          ) {
            throw new Error(
              `${key} has to be either 'ask', 'always' or 'never'. Value found: ${element}`
            )
          }
          break
        case 'tags':
          if (typeof element !== 'boolean') {
            throw new Error(
              `${key} has to be either 'true' or 'false'. Value found: ${element}`
            )
          }
          break
      }
    }
  }
  return true
}

const checkGitRefFormat = (value: string): boolean => {
  return (
    exec(`git check-ref-format "${value}"`, {
      silent: true
    }).code === 0
  )
}

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

const defaultConfigFileName: string = 'gof.config.js'

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

const getFileExt = (configFile: string) => {
  return extname(configFile)
}

const generateCommentedValues = (configValues: ConfigValues) => {
  const output: string[] = []
  for (const key in configValues) {
    if (configValues.hasOwnProperty(key)) {
      const element =
        typeof configValues[key] === 'string'
          ? `"${configValues[key]}"`
          : configValues[key]
      output.push(`\t/** ${getCommentFor(key)} */\n\t${key}: ${element},`)
    }
  }
  return output
}

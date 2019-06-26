/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { exec, test, sed, ShellString } from 'shelljs'
import findUp from 'find-up'
// import { error, info } from './utils/text'
import { extname } from 'path'

export type ConfigValues = { [key: string]: any }

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
export function getDefaultConfigValues (): ConfigValues {
  return { ...defaultConfigValues, ...loadConfigValues() }
}

export function loadConfigFile (configFile?: string): ConfigValues {
  if (!configFile || !test('-f', configFile)) {
    return defaultConfigValues
  }

  const configValues =
    getFileExt(configFile) === '.js'
      ? require(configFile)
      : JSON.parse(sed(/(\/\*[\w\W]+\*\/|(\/\/.*))/g, '', configFile))

  if (sanityCheck(configValues)) {
    return { ...defaultConfigValues, ...configValues }
  } else {
    return { ...defaultConfigValues }
  }
}

export function loadConfigValues (): ConfigValues {
  const configFile = findUp.sync(defaultConfigFileNames) || undefined

  return loadConfigFile(configFile)
}

export function writeConfigFile ({
  file = defaultConfigFileName,
  data = defaultConfigValues
}: {
  file?: string
  data?: any
}): boolean {
  let toWrite: string

  if (!sanityCheck(data)) return false

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

export function isValidBranchName (branchName: string): boolean {
  return checkGitRefFormat(`refs/heads/${branchName}`)
}

export function isValidTagName (tagName: string): boolean {
  return checkGitRefFormat(`refs/tags/${tagName}`)
}

function sanityCheck (configValues: ConfigValues): boolean {
  for (const key in configValues) {
    const element = configValues[key]
    switch (key) {
      case 'main':
      case 'development':
      case 'hotfix':
      case 'release':
      case 'feature':
        if (!isValidBranchName(element)) {
          return false
        }
        break
      case 'usedev':
        if (typeof element !== 'boolean') {
          return false
        }
        break
      case 'integration':
        if (typeof element !== 'number' || (element < 1 || element > 3)) {
          return false
        }
        break
      case 'interactive':
      case 'push':
      case 'delete':
        if (
          typeof element !== 'string' ||
          !element.match(/(ask|always|never)/)
        ) {
          return false
        }
        break
      case 'tags':
        if (typeof element !== 'boolean') {
          return false
        }
        break
    }
  }
  return true
}

function checkGitRefFormat (value: string): boolean {
  return (
    exec(`git check-ref-format "${value}"`, {
      silent: true
    }).code === 0
  )
}

const defaultConfigValues: ConfigValues = {
  main: 'master',
  usedev: false,
  development: 'develop',
  feature: 'feature',
  release: 'release',
  hotfix: 'hotfix',
  integration: 1,
  interactive: 'always',
  push: 'always',
  delete: 'always',
  tags: true
}

const defaultConfigFileName: string = 'gof.config.js'

const defaultConfigFileNames: string[] = [
  defaultConfigFileName,
  '.gofrc.js',
  '.gofrc.json'
]

// const supportedExtensions = ['.js', '.json']

function getCommentFor (key: string): string {
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

function getFileExt (configFile: string) {
  return extname(configFile)
}

function generateCommentedValues (configValues: ConfigValues) {
  const output: string[] = []
  for (const key in configValues) {
    // if (configValues.hasOwnProperty(key)) {
    const element =
      typeof configValues[key] === 'string'
        ? `"${configValues[key]}"`
        : configValues[key]
    output.push(`\t/** ${getCommentFor(key)} */\n\t${key}: ${element},`)
    // }
  }
  return output
}

/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import inquirer from 'inquirer'
import {
  isValidBranchName,
  writeConfigFile,
  getDefaultConfigValues
  // ConfigValues
} from '../core'

import { success, error } from '../utils/text'

export default {
  command: 'init [options]',
  desc: 'Generate a config file',
  builder: (yargs: any) => {
    return yargs.option('y', {
      alias: 'default-values',
      describe:
        'Auto-generate config file using default values. These values WILL NOT overwrite existing values!'
    })
  },
  handler: async function (argv: { [key: string]: any }) {
    try {
      const jsonValues = argv.defaultValues
        ? getDefaultConfigValues()
        : await inquirer.prompt(generateQuestions(argv))

      console.log(JSON.stringify(jsonValues, null, 2))

      // if (!argv.dryRun) {
      if (argv.defaultValues || (await askConfirmationBeforeWrite())) {
        if (writeConfigFile({ data: jsonValues })) {
          console.log(success('Initialisation done!'))
        } else {
          console.error(error('Cannot write config file!'))
        }
      }
      // }
    } catch (err) {
      console.error(error(err))
    }
  }
}

function generateQuestions (argv: { [key: string]: any }): any {
  return [
    {
      name: 'main',
      type: 'input',
      message: 'Main (production) branch:',
      default: argv.main || 'master',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      name: 'usedev',
      type: 'confirm',
      default: argv.usedev || false,
      message: 'Do you use a development branch?'
    },
    {
      name: 'development',
      type: 'input',
      message: 'Development branch:',
      default: argv.development || 'develop',
      when: function (answers: { [key: string]: any }) {
        return answers.usedev
      },
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      name: 'feature',
      type: 'input',
      message: 'Feature branch:',
      default: argv.feature || 'feature',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      name: 'release',
      type: 'input',
      message: 'Release branch:',
      default: argv.release || 'release',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      name: 'hotfix',
      type: 'input',
      message: 'Hotfix branch:',
      default: argv.hotfix || 'hotfix',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      type: 'list',
      name: 'integration',
      message: 'Which feature branch integration method do you want to use?',
      default: argv.integration - 1 || 1,
      choices: [
        {
          name:
            'Integrate feature branch with main/development using rebase (rebase -> merge --ff-only).',
          value: 1,
          short: 'rebase'
        },
        {
          name:
            'Feature is merged in main/development à la GitFlow (merge --no-ff).',
          value: 2,
          short: 'merge --no-ff'
        },
        {
          name:
            'Mix the previous two: rebase and merge (rebase -> merge --no-ff).',
          value: 3,
          short: 'rebase + merge --no-ff'
        }
      ]
    },
    {
      name: 'interactive',
      type: 'expand',
      message: 'Do you want to use rebase interactively (rebase -i)?',
      default: argv.interactive || 'always',
      choices: [
        {
          key: 'y',
          name: 'Always',
          value: 'always'
        },
        {
          key: 'n',
          name: 'Never',
          value: 'never'
        },
        {
          key: 'a',
          name: 'Ask me every time',
          value: 'ask'
        }
      ],
      when: function (answers: { [key: string]: any }) {
        return answers.integration !== 2
      }
    },
    {
      name: 'push',
      type: 'expand',
      message: 'Do you want to push to origin after merging?',
      default: argv.push || 'always',
      choices: [
        {
          key: 'y',
          name: 'Always',
          value: 'always'
        },
        {
          key: 'n',
          name: 'Never',
          value: 'never'
        },
        {
          key: 'a',
          name: 'Ask me every time',
          value: 'ask'
        }
      ]
    },
    {
      name: 'delete',
      type: 'expand',
      message: 'Do you want to delete working branch after merging?',
      default: argv.push || 'always',
      choices: [
        {
          key: 'y',
          name: 'Always',
          value: 'always'
        },
        {
          key: 'n',
          name: 'Never',
          value: 'never'
        },
        {
          key: 'a',
          name: 'Ask me every time',
          value: 'ask'
        }
      ]
    }
  ]
}

async function askConfirmationBeforeWrite () {
  const ans: { write: boolean } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'write',
      message: 'Write to config file?'
    }
  ])
  return ans.write
}

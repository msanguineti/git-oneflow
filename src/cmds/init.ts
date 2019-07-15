/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { success, error } from '../utils/text'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { prompt, Question, Answers } from 'inquirer'
import { CommandModule, Arguments } from 'yargs'
import { isValidBranchName, writeConfigFile, ConfigValues } from '../core'

export class Init implements CommandModule {
  public command: string = 'init [options]'

  public describe: string = 'Generate a config file'

  public handler = async (argv: Arguments): Promise<void> => {
    try {
      const jsonValues: ConfigValues = await prompt(generateQuestions(argv))

      console.log(JSON.stringify(jsonValues, null, 2))

      if (await askConfirmationBeforeWrite()) {
        if (writeConfigFile({ data: jsonValues })) {
          console.log(success('Initialisation done!'))
        } else {
          console.error(error('Cannot write config file!'))
        }
      }
    } catch (err) {
      console.error(error(err))
    }
  }
}

const generateQuestions = (argv: Arguments): Question[] => {
  return [
    {
      name: 'main',
      type: 'input',
      message: 'Main (production) branch:',
      default: (argv.main as string) || 'master',
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
      default: (argv.usedev as boolean) || false,
      message: 'Do you use a development branch?'
    },
    {
      name: 'development',
      type: 'input',
      message: 'Development branch:',
      default: (argv.development as string) || 'develop',
      when: (answers: Answers) => {
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
      default: (argv.feature as string) || 'feature',
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
      default: (argv.release as string) || 'release',
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
      default: (argv.hotfix as string) || 'hotfix',
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
      default: (argv.integration as number) - 1 || 1,
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
      default: (argv.interactive as string) || 'always',
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
      when: (answers: Answers) => {
        return answers.integration !== 2
      }
    },
    {
      name: 'push',
      type: 'expand',
      message: 'Do you want to push to origin after merging?',
      default: (argv.push as string) || 'always',
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
      default: (argv.push as string) || 'always',
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
      name: 'tags',
      type: 'confirm',
      default: (argv.usedev as boolean) || true,
      message: 'Do you want automatic tagging of releases/hotfixes?'
    }
  ]
}

const askConfirmationBeforeWrite = async (): Promise<boolean> => {
  const ans: { write: boolean } = await prompt([
    {
      type: 'confirm',
      name: 'write',
      message: 'Write to config file?'
    }
  ])
  return ans.write
}

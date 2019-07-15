/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { Answers, prompt, Question } from 'inquirer'
import { Arguments, CommandModule, Argv } from 'yargs'
import {
  ConfigValues,
  isValidBranchName,
  writeConfigFile,
  getDefaultConfigValues
} from '../core'
import { error, success, info } from '../utils/text'
import { exit } from 'shelljs'

export class Init implements CommandModule {
  public command: string = 'init [options]'

  public describe: string = 'Generate a config file'

  public builder = (yargs: Argv): Argv => {
    return yargs.option('d', {
      alias: 'defaultValues',
      describe: 'Generates default value file. Overwrites old values'
    })
  }

  public handler = async (argv: Arguments): Promise<void> => {
    try {
      if (argv.defaultValues) {
        writeConfigFile({ data: getDefaultConfigValues() })
        console.log(info('Config file created: gof.config.js'))
      } else {
        const jsonValues: ConfigValues = await prompt(generateQuestions(argv))

        console.log(JSON.stringify(jsonValues, null, 2))

        if (await askConfirmationBeforeWrite()) {
          if (writeConfigFile({ data: jsonValues })) {
            console.log(success('Initialisation done!'))
          } else {
            console.error(error('Cannot write config file!'))
          }
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
      default: (argv.main as string) || 'master',
      message: 'Main (production) branch:',
      name: 'main',
      type: 'input',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      default: (argv.usedev as boolean) || false,
      message: 'Do you use a development branch?',
      name: 'usedev',
      type: 'confirm'
    },
    {
      default: (argv.development as string) || 'develop',
      message: 'Development branch:',
      name: 'development',
      type: 'input',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      },
      when: (answers: Answers) => {
        return answers.usedev
      }
    },
    {
      default: (argv.feature as string) || 'feature',
      message: 'Feature branch:',
      name: 'feature',
      type: 'input',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      default: (argv.release as string) || 'release',
      message: 'Release branch:',
      name: 'release',
      type: 'input',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      default: (argv.hotfix as string) || 'hotfix',
      message: 'Hotfix branch:',
      name: 'hotfix',
      type: 'input',
      validate: (value: string) => {
        return (
          isValidBranchName(value) ||
          'Please, choose a valid name for the branch'
        )
      }
    },
    {
      choices: [
        {
          name:
            'Integrate feature branch with main/development using rebase (rebase -> merge --ff-only).',
          short: 'rebase',
          value: 1
        },
        {
          name:
            'Feature is merged in main/development à la GitFlow (merge --no-ff).',
          short: 'merge --no-ff',
          value: 2
        },
        {
          name:
            'Mix the previous two: rebase and merge (rebase -> merge --no-ff).',
          short: 'rebase + merge --no-ff',
          value: 3
        }
      ],
      default: (argv.integration as number) - 1 || 1,
      message: 'Which feature branch integration method do you want to use?',
      name: 'integration',
      type: 'list'
    },
    {
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
      default: (argv.interactive as string) || 'always',
      message: 'Do you want to use rebase interactively (rebase -i)?',
      name: 'interactive',
      type: 'expand',
      when: (answers: Answers) => {
        return answers.integration !== 2
      }
    },
    {
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
      default: (argv.push as string) || 'always',
      message: 'Do you want to push to origin after merging?',
      name: 'push',
      type: 'expand'
    },
    {
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
      default: (argv.push as string) || 'always',
      message: 'Do you want to delete working branch after merging?',
      name: 'delete',
      type: 'expand'
    },
    {
      default: (argv.usedev as boolean) || true,
      message: 'Do you want automatic tagging of releases/hotfixes?',
      name: 'tags',
      type: 'confirm'
    }
  ]
}

const askConfirmationBeforeWrite = async (): Promise<boolean> => {
  const ans: { write: boolean } = await prompt([
    {
      message: 'Write to config file?',
      name: 'write',
      type: 'confirm'
    }
  ])
  return ans.write
}

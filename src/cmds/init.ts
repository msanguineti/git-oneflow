/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Answers, prompt, QuestionCollection } from 'inquirer'
import { Arguments, CommandModule, Argv } from 'yargs'
import {
  ConfigValues,
  isValidBranchName,
  writeConfigFile,
  getDefaultConfigValues
} from '../core'
import { error, success, info } from '../utils/text'

const expandAnswer = (
  dFault: string,
  message: string,
  name: string,
  choices: { key: string; name: string; value: string }[],
  when?: Function
): {
  choices: {
    key: string;
    name: string;
    value: string;
  }[];
  default: string;
  message: string;
  name: string;
  type: string;
  when: Function | undefined;
} => {
  return {
    choices,
    default: dFault,
    message,
    name,
    type: 'expand',
    when
  }
}

const confirmAnswer = (
  dFault: boolean,
  message: string,
  name: string
): {
  default: boolean;
  message: string;
  name: string;
  type: string;
} => {
  return {
    default: dFault,
    message,
    name,
    type: 'confirm'
  }
}

const inputBranchName = (
  dFault: string,
  message: string,
  name: string,
  when?: Function
): Answers => {
  return {
    default: dFault,
    message,
    name,
    type: 'input',
    validate: (value: string): boolean | string => {
      return (
        isValidBranchName(value) || 'Please, choose a valid name for the branch'
      )
    },
    when
  }
}

const generateQuestions = (argv: Arguments): QuestionCollection<Answers>[] => {
  return [
    inputBranchName(
      (argv.main as string) || 'master',
      'Main (production) branch:',
      'main'
    ),
    confirmAnswer(
      (argv.usedev as boolean) || false,
      'Do you use a development branch?',
      'usedev'
    ),
    inputBranchName(
      (argv.development as string) || 'develop',
      'Development branch:',
      'development',
      (answers: Answers) => {
        return answers.usedev
      }
    ),
    inputBranchName(
      (argv.feature as string) || 'feature',
      'Feature branch:',
      'feature'
    ),
    inputBranchName(
      (argv.release as string) || 'release',
      'Release branch:',
      'release'
    ),
    inputBranchName(
      (argv.hotfix as string) || 'hotfix',
      'Hotfix branch:',
      'hotfix'
    ),
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

    expandAnswer(
      (argv.interactive as string) || 'always',
      'Do you want to use rebase interactively (rebase -i)?',
      'interactive',
      [
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
      (answers: Answers) => {
        return answers.integration !== 2
      }
    ),

    expandAnswer(
      (argv.push as string) || 'always',
      'Do you want to push to origin after merging?',
      'push',
      [
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
    ),
    expandAnswer(
      (argv.push as string) || 'always',
      'Do you want to delete working branch after merging?',
      'delete',
      [
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
    ),
    confirmAnswer(
      (argv.usedev as boolean) || true,
      'Do you want automatic tagging of releases/hotfixes?',
      'tags'
    )
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
export class Init implements CommandModule {
  public command = 'init [options]'

  public describe = 'Generate a config file'

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
        console.log('Config file created:', info('gof.config.js'))
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

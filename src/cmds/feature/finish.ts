/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { prompt } from 'inquirer'
import { spawnSync } from 'child_process'
import { exec } from 'shelljs'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { CommandModule, Argv, Arguments } from 'yargs'
import { isValidBranchName } from '../../core'

export class FinishFeature implements CommandModule {
  public command: string = 'finish <featureBranch> [options]'

  public describe: string = 'Finish a feature'

  public builder = (yargs: Argv): Argv => {
    return yargs.option('i', {
      alias: 'interactive',
      describe:
        'Rebase using `rebase -i`. It applies only if `integration` option is set to 1 or 3'
    })
  }

  public handler = (argv: Arguments) => {
    const mergeInto = argv.usedev ? argv.development : argv.main
    if (isValidBranchName(mergeInto)) return handleFinish(argv, mergeInto)
  }
}

const handleFinish = async (
  argv: Arguments,
  mergeInto: string | unknown
): Promise<void> => {
  if (argv.integration !== 2) {
    await rebaseStep(argv, mergeInto)
  }

  exec(`git checkout ${mergeInto}`)

  let strategy = '--no-ff'
  if (argv.integration === 2) {
    strategy = '--ff-only'
  }

  exec(`git merge ${strategy} ${argv.feature}/${argv.featureBranch}`)

  switch (argv.push) {
    case 'always':
      exec(`git push origin ${mergeInto}`)
      break
    case 'never':
      break
    case 'ask':
      if (await ask(`Do you want to push to ${mergeInto}?`)) {
        exec(`git push origin ${mergeInto}`)
      }
      break
  }

  switch (argv.deleteBranch) {
    case 'always':
      exec(`git branch -d ${argv.feature}/${argv.featureBranch}`)
      break
    case 'never':
      break
    case 'ask':
      if (
        await ask(
          `Do you want to delete branch ${argv.feature}/${argv.featureBranch}?`
        )
      ) {
        exec(`git branch -d ${argv.feature}/${argv.featureBranch}`)
      }
      break
  }
}

const rebaseStep = async (
  argv: Arguments,
  mergeInto: string | unknown
): Promise<void> => {
  exec(`git checkout ${argv.feature}/${argv.featureBranch}`)
  switch (argv.interactive) {
    case 'always':
      spawnSync('git', ['rebase', '-i', `${mergeInto}`], {
        stdio: 'inherit'
      })
      break
    case 'never':
      exec(`git rebase ${mergeInto}`)
      break
    case 'ask':
      if (await ask('Do you want to use rebase interactively?')) {
        spawnSync('git', ['rebase', '-i', `${mergeInto}`], {
          stdio: 'inherit'
        })
      } else {
        exec(`git rebase ${mergeInto}`)
      }
  }
}

const ask = async (question: string): Promise<string> => {
  const answer: { accept: string } = await prompt([
    {
      type: 'confirm',
      name: 'accept',
      message: question
    }
  ])
  return answer.accept
}

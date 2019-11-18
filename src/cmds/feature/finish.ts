/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { spawnSync } from 'child_process'
import { prompt } from 'inquirer'
import { exec } from 'shelljs'
import { Arguments, Argv, CommandModule } from 'yargs'
import { isValidBranchName, loadConfigFile } from '../../core'

export class FinishFeature implements CommandModule {
  public command: string = 'finish <featureBranch> [options]'

  public describe: string = 'Finish a feature'

  public builder = (yargs: Argv): Argv => {
    return yargs.option('o', {
      alias: 'overwrite-interactive',
      describe: 'Rebase using `rebase -i`. (Only for strategy 1 and 3)'
    })
  }

  public handler = (argv: Arguments) => {
    if (argv.c) loadConfigFile(argv.c as string)

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

  if (argv['overwrite-interactive']) {
    rebaseInteractively(mergeInto)
  } else {
    switch (argv.interactive) {
      case 'always':
        rebaseInteractively(mergeInto)
        break
      case 'never':
        exec(`git rebase ${mergeInto}`)
        break
      case 'ask':
        if (await ask('Do you want to use rebase interactively?')) {
          rebaseInteractively(mergeInto)
        } else {
          exec(`git rebase ${mergeInto}`)
        }
    }
  }
}

const ask = async (question: string): Promise<string> => {
  const answer: { accept: string } = await prompt([
    {
      message: question,
      name: 'accept',
      type: 'confirm'
    }
  ])
  return answer.accept
}
function rebaseInteractively (mergeInto: unknown) {
  spawnSync('git', ['rebase', '-i', `${mergeInto}`], { stdio: 'inherit' })
}

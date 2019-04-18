/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// import { isValidBranchName } from '../core'
import { exec } from 'shelljs'

// eslint-disable-next-line
import { ConfigValues } from '../core'
import inquirer from 'inquirer'

export default {
  command: 'finish <featureBranch> [options]',
  desc: 'Finish a feature',
  builder: (yargs: any) => {
    return yargs.option('i', {
      alias: 'interactive',
      describe:
        'Rebase using `rebase -i`. It applies only if `integration` option is set to 1 or 3'
    })
  },
  handler: (argv: { [key: string]: any }) => {
    const mergeInto = argv.usedev ? argv.development : argv.main

    handleFinish(argv, mergeInto)
  }
}

async function handleFinish (argv: ConfigValues, mergeInto: string) {
  if (argv.integration !== 2) {
    await rebaseStep(argv, mergeInto)
  }

  exec(`git checkout ${mergeInto}`)

  if (argv.integration === 2) {
    exec(`git merge --ff-only ${argv.feature}/${argv.featureBranch}`)
  } else {
    exec(`git merge --no-ff ${argv.feature}/${argv.featureBranch}`)
  }

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

async function rebaseStep (argv: ConfigValues, mergeInto: string) {
  exec(`git checkout ${argv.feature}/${argv.featureBranch}`)
  switch (argv.interactive) {
    case 'always':
      exec(`git rebase -i ${mergeInto}`)
      break
    case 'never':
      exec(`git rebase ${mergeInto}`)
      break
    case 'ask':
      if (await ask('Do you want to use rebase interactively?')) {
        exec(`git rebase -i ${mergeInto}`)
      } else {
        exec(`git rebase ${mergeInto}`)
      }
  }
}

async function ask (question: string) {
  const answer: { accept: string } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'accept',
      message: question
    }
  ])
  return answer.accept
}

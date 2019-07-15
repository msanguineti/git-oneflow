/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { prompt } from 'inquirer'
import { exec } from 'shelljs'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { Arguments, CommandModule } from 'yargs'
import { info } from '../../utils/text'

// const git = simplegit()

export class FinishHotfix implements CommandModule {
  public command: string = 'finish <hotfixName>'

  public describe: string = 'Finishes a hotfix.'

  public handler = (argv: Arguments): Promise<void> => {
    return handleFinish(argv)
  }
}

const handleFinish = async (argv: Arguments): Promise<void> => {
  const mergeInto = argv.usedev ? argv.development : argv.main

  exec(`git checkout ${argv.hotfix}/${argv.hotfixName}`)

  if (argv.tags) {
    exec(`git tag ${argv.hotfixName}`)
  }
  exec(`git checkout ${mergeInto}`)
  exec(`git merge ${argv.hotfix}/${argv.hotfixName}`)
  const tags = argv.tags ? { '--tags': null } : {}
  switch (argv.push) {
    case 'always':
      exec(`git push ${tags} origin ${mergeInto}`)
      break
    case 'never':
      console.log(
        `Remember to ${info(
          `git push --tags origin ${mergeInto}`
        )} when you're done.`
      )
      break
    case 'ask':
      if (await ask(`Do you want to push to ${mergeInto}?`)) {
        exec(`git push ${tags} origin ${mergeInto}`)
      }
      break
  }
  if (argv.usedev) {
    exec(`git checkout master`)
    exec(`git merge --ff-only ${argv.hotfixName}`)
  }
  switch (argv.deleteBranch) {
    case 'always':
      await deleteBranch(argv)
      break
    case 'never':
      break
    case 'ask':
      if (
        await ask(
          `Do you want to delete branch ${argv.hotfix}/${argv.hotfixName}?`
        )
      ) {
        await deleteBranch(argv)
      }
      break
  }
}

const deleteBranch = async (argv: Arguments): Promise<void> => {
  exec(`git branch -d ${argv.hotfix}/${argv.hotfixName}`)
  if (
    await ask(
      `Do you want to delete on origin branch ${argv.hotfix}/${argv.hotfixName}?`
    )
  ) {
    exec(`git push origin :${argv.hotfix}/${argv.hotfixName}`)
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

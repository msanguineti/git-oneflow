/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { info } from '../../utils/text'
import inquirer from 'inquirer'
import { exec } from 'shelljs'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { CommandModule, Arguments } from 'yargs'

// const git = simplegit()

export class FinishHotfix implements CommandModule {
  public command = 'finish <hotfixName>'

  public describe = 'Finishes a hotfix.'

  public handler = async (argv: Arguments) => {
    return handleFinish(argv)
  }
}

async function handleFinish (argv: { [key: string]: any }) {
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

async function deleteBranch (argv: { [key: string]: any }) {
  exec(`git branch -d ${argv.hotfix}/${argv.hotfixName}`)
  if (
    await ask(
      `Do you want to delete on origin branch ${argv.hotfix}/${argv.hotfixName}?`
    )
  ) {
    exec(`git push origin :${argv.hotfix}/${argv.hotfixName}`)
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

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

export class FinishRelease implements CommandModule {
  public command = 'finish <releaseName>'

  public describe = 'Finishes a release.'

  public handler = async (argv: Arguments) => {
    return handleFinish(argv)
  }
}

async function handleFinish (argv: { [key: string]: any }) {
  const mergeInto = argv.usedev ? argv.development : argv.main

  exec(`git checkout ${argv.release}/${argv.releaseName}`)
  // await git.checkout(`${argv.release}/${argv.releaseName}`)
  if (argv.tags) exec(`git tag ${argv.releaseName}`)
  // if (argv.tags) await git.addTag(`${argv.releaseName}`)
  exec(`git checkout ${mergeInto}`)
  // await git.checkout(`${mergeInto}`)
  exec(`git merge ${argv.release}/${argv.releaseName}`)
  // await git.merge([`${argv.release}/${argv.releaseName}`])

  const tags = argv.tags ? { '--tags': null } : {}

  switch (argv.push) {
    case 'always':
      exec(`git push ${tags} origin ${mergeInto}`)
      // await git.push('origin', `${mergeInto}`, tags)
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
        // await git.push('origin', `${mergeInto}`, tags)
      }
      break
  }
  if (argv.usedev) {
    exec(`git checkout master`)
    // await git.checkout('master')
    exec(`git merge --ff-only ${argv.release}/${argv.releaseName}`)
    // await git.merge(['--ff-only', `${argv.release}/${argv.releaseName}`])
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
          `Do you want to delete branch ${argv.release}/${argv.releaseName}?`
        )
      ) {
        await deleteBranch(argv)
      }
      break
  }
}

async function deleteBranch (argv: { [key: string]: any }) {
  exec(`git branch -d ${argv.release}/${argv.releaseName}`)
  // await git.deleteLocalBranch(`${argv.release}/${argv.releaseName}`)
  if (
    await ask(
      `Do you want to delete on origin branch ${argv.release}/${argv.releaseName}?`
    )
  ) {
    // await git.push('origin', `:${argv.release}/${argv.releaseName}`)
    exec(`git push origin :${argv.release}/${argv.releaseName}`)
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

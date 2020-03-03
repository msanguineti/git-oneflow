/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { prompt } from 'inquirer'
import { exec } from 'shelljs'
import { Arguments, CommandModule } from 'yargs'
import { info } from '../../utils/text'
import { loadConfigFile } from '../../core'

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
    exec(`git checkout ${argv.main}`)
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

export class FinishHotfix implements CommandModule {
  public command = 'finish <hotfixName>'

  public describe = 'Finishes a hotfix.'

  public handler = (argv: Arguments): Promise<void> => {
    if (argv.c) loadConfigFile(argv.c as string)

    return handleFinish(argv)
  }
}

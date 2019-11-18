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

export class FinishRelease implements CommandModule {
  public command: string = 'finish <releaseName>'

  public describe: string = 'Finishes a release.'

  public handler = (argv: Arguments): Promise<void> => {
    return handleFinish(argv)
  }
}

const handleFinish = async (argv: Arguments) => {
  const mergeInto = argv.usedev ? argv.development : argv.main

  exec(`git checkout ${argv.release}/${argv.releaseName}`)
  if (argv.tags) exec(`git tag ${argv.releaseName}`)
  exec(`git checkout ${mergeInto}`)
  exec(`git merge ${argv.release}/${argv.releaseName}`)

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
    exec(`git merge --ff-only ${argv.release}/${argv.releaseName}`)
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

const deleteBranch = async (argv: Arguments) => {
  exec(`git branch -d ${argv.release}/${argv.releaseName}`)
  if (
    await ask(
      `Do you want to delete on origin branch ${argv.release}/${
        argv.releaseName
      }?`
    )
  ) {
    exec(`git push origin :${argv.release}/${argv.releaseName}`)
  }
}

const ask = async (question: string) => {
  const answer: { accept: string } = await prompt([
    {
      message: question,
      name: 'accept',
      type: 'confirm'
    }
  ])
  return answer.accept
}

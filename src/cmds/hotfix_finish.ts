/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { exec } from 'shelljs'
import { info } from '../utils/text'
import inquirer from 'inquirer'

export default {
  command: 'finish <hotfixBranch>',
  desc:
    'Finishes a hotfix. Hotfix branch name should be something like `2.3.1` or some version convention',
  builder: (yargs: any) => {},
  handler: async (argv: { [key: string]: any }) => {
    const mergeInto = argv.usedev ? argv.development : argv.main

    exec(`git checkout ${argv.hotfix}/${argv.hotfixBranch}`)
    exec(`git tag ${argv.hotfixBranch}`)
    exec(`git checkout ${mergeInto}`)
    exec(`git merge ${argv.hotfix}/${argv.hotfixBranch}`)

    switch (argv.push) {
      case 'always':
        exec(`git push --tags origin ${mergeInto}`)
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
          exec(`git push --tags origin ${mergeInto}`)
        }
        break
    }

    if (argv.usedev) {
      exec(`git checkout master`)
      exec(`git merge --ff-only ${argv.hotfixBranch}`)
    }

    switch (argv.deleteBranch) {
      case 'always':
        deleteBranch(argv)
        break
      case 'never':
        break
      case 'ask':
        if (
          await ask(
            `Do you want to delete branch ${argv.hotfix}/${argv.hotfixBranch}?`
          )
        ) {
          deleteBranch(argv)
        }
        break
    }
  }
}

function deleteBranch (argv: { [key: string]: any }) {
  exec(`git branch -d ${argv.hotfix}/${argv.hotfixBranch}`)
  exec(`git push origin :${argv.hotfix}/${argv.hotfixBranch}`)
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

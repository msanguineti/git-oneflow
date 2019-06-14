/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// import { exec } from 'shelljs'
import { info } from '../../utils/text'
import inquirer from 'inquirer'
import simplegit from 'simple-git/promise'

const git = simplegit()

export default {
  command: 'finish <hotfixName>',
  desc: 'Finishes a hotfix.',
  builder: (yargs: any) => {},
  handler: async (argv: { [key: string]: any }) => {
    try {
      return handleFinish(argv)
    } catch (err) {
      throw err
    }
  }
}

async function handleFinish (argv: { [key: string]: any }) {
  const mergeInto = argv.usedev ? argv.development : argv.main

  // exec(`git checkout ${argv.hotfix}/${argv.hotfixName}`);
  await git.checkout(`${argv.hotfix}/${argv.hotfixName}`)
  // exec(`git tag ${argv.hotfixName}`);
  await git.addTag(`${argv.hotfixName}`)
  // exec(`git checkout ${mergeInto}`);
  await git.checkout(`${mergeInto}`)
  // exec(`git merge ${argv.hotfix}/${argv.hotfixName}`);
  await git.merge([`${argv.hotfix}/${argv.hotfixName}`])

  switch (argv.push) {
    case 'always':
      // exec(`git push --tags origin ${mergeInto}`);
      await git.push('origin', `${mergeInto}`, { '--tags': null })
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
        // exec(`git push --tags origin ${mergeInto}`);
        await git.push('origin', `${mergeInto}`, { '--tags': null })
      }
      break
  }
  if (argv.usedev) {
    // exec(`git checkout master`);
    await git.checkout('master')
    // exec(`git merge --ff-only ${argv.hotfixName}`);
    await git.merge(['--ff-only', `${argv.hotfixName}`])
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
  // exec(`git branch -d ${argv.hotfix}/${argv.hotfixName}`)
  await git.deleteLocalBranch(`${argv.hotfix}/${argv.hotfixName}`)
  // exec(`git push origin :${argv.hotfix}/${argv.hotfixName}`)
  if (
    await ask(
      `Do you want to delete on origin branch ${argv.hotfix}/${
        argv.hotfixName
      }?`
    )
  ) {
    await git.push('origin', `:${argv.hotfix}/${argv.hotfixName}`)
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

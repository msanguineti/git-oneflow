// Copyright (c) 2019 Mirco Sanguineti
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import sh from 'shelljs'
export default class Feature {
  start (featureBranch: string, featureName: string, mainBranch: string) {
    const checkout = sh.exec(
      `git checkout -b ${featureBranch}/${featureName} ${mainBranch}`
    )
    if (checkout.code !== 0) {
      console.error(`${checkout.stderr}`)
      sh.exit(1)
    }
  }

  async finish (
    featureBranch: string,
    featureName: string,
    mainBranch: string,
    options: { [key: string]: any }
  ): Promise<void> {
    try {
      if (options['strategy'] === 1 || options['strategy'] === 3) {
        await runExec(`git checkout ${featureBranch}/${featureName}`)
        const interactive = options['interactive'] ? '-i' : undefined
        await runExec(`git rebase ${interactive} ${mainBranch}`)
      }
      await runExec(`git checkout ${mainBranch}`)
      await runExec(`git merge ${options['strategy'] === 1 ? '--ff-only' : '--no-ff'} ${featureBranch}/${featureName}`)
      if (options['push']) {
        await runExec(`git push ${mainBranch}`)
      }
      if (options['delete']) {
        await runExec(`git branch -d ${featureBranch}/${featureName}`)
      }
    } catch (err) {
      console.error(err)
      sh.exit(1)
    }
  }
}

function runExec (command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    sh.exec(command, (code, stdout, stderr) => {
      if (code !== 1) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}

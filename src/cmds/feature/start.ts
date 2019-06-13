/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
// import { exec } from 'shelljs'
import { isValidBranchName } from '../../core'
import simplegit from 'simple-git/promise'

const git = simplegit()

export default {
  command: 'start <featureBranch>',
  desc: 'Start a new feature',
  builder: (yargs: any) => {},
  handler: async (argv: { [key: string]: any }) => {
    const branchOff = argv.usedev ? argv.development : argv.main

    if (isValidBranchName(argv.featureBranch)) {
      // exec(`git checkout -b ${argv.feature}/${argv.featureBranch} ${branchOff}`)
      try {
        return git.checkoutBranch(
          `${argv.feature}/${argv.featureBranch}`,
          `${branchOff}`
        )
      } catch (err) {
        throw err
      }
    }
  }
}

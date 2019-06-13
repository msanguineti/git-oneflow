/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { isValidBranchName } from '../../core'
// import { exec } from 'shelljs'
import simplegit from 'simple-git/promise'

const git = simplegit()

export default {
  command: 'start <hotfixName> <from>',
  desc:
    'Start a new hotfix.\n<hotfixName> should be something like `2.3.1`.\n<from> should be a branch (e.g. develop) or a commit (e.g. 9af345)',
  builder: (yargs: any) => {},
  handler: async (argv: { [key: string]: any }) => {
    if (isValidBranchName(argv.hotfixName)) {
      // exec(`git checkout -b ${argv.hotfix}/${argv.hotfixName} ${argv.from}`)
      try {
        return git.checkoutBranch(
          `${argv.hotfix}/${argv.hotfixName}`,
          `${argv.from}`
        )
      } catch (err) {
        throw err
      }
    }
  }
}

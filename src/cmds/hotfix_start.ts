/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { isValidBranchName } from '../core'
import { exec } from 'shelljs'

export default {
  command: 'start <branchName> <from>',
  desc: 'Start a new hotfix',
  builder: (yargs: any) => {},
  handler: (argv: { [key: string]: any }) => {
    if (isValidBranchName(argv.branchName)) {
      exec(`git checkout -b ${argv.hotfix}/${argv.branchName} ${argv.from}`)
    }
  }
}

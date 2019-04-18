import { isValidBranchName } from '../core'
import { exec } from 'shelljs'

/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export default {
  command: 'start <branchName> <from>',
  desc: 'Start a new release',
  builder: (yargs: any) => {},
  handler: (argv: { [key: string]: any }) => {
    if (isValidBranchName(argv.branchName)) {
      exec(`git checkout -b ${argv.release}/${argv.branchName} ${argv.from}`)
    }
  }
}

/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { isValidBranchName } from '../../core'
import { exec } from 'shelljs'

export default {
  command: 'start <hotfixName> <from>',
  desc:
    'Start a new hotfix.\n<hotfixName> should be something like `2.3.1`.\n<from> should be a branch (e.g. develop) or a commit (e.g. 9af345)',
  builder: (yargs: any) => {},
  handler: (argv: { [key: string]: any }) => {
    if (isValidBranchName(argv.hotfixName)) {
      exec(`git checkout -b ${argv.hotfix}/${argv.hotfixName} ${argv.from}`)
    }
  }
}

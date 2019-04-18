/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { isValidBranchName } from '../core'
import { exec } from 'shelljs'

export default {
  command: 'start <releaseName> <from>',
  desc:
    'Start a new release.\n<releaseName> should be something like `2.3.0`.\n<from> should be a branch (e.g. develop) or a commit (e.g. 9af345)',
  builder: (yargs: any) => {},
  handler: (argv: { [key: string]: any }) => {
    if (isValidBranchName(argv.releaseName)) {
      exec(`git checkout -b ${argv.release}/${argv.releaseName} ${argv.from}`)
    }
  }
}

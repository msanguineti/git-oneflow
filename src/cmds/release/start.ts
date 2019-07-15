/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { isValidBranchName } from '../../core'
import { exec } from 'shelljs'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { CommandModule, Arguments } from 'yargs'

export class StartRelease implements CommandModule {
  command = 'start <releaseName> <from>'

  describe = `Start a new release.
  <releaseName> should be something like \`2.3.0\`.
  <from> should be a branch (e.g. develop) or a commit (e.g. 9af345)`

  handler = (argv: Arguments) => {
    if (
      isValidBranchName(argv.releaseName) &&
      (argv.from ? isValidBranchName(argv.from) : true)
    ) {
      exec(`git checkout -b ${argv.release}/${argv.releaseName} ${argv.from}`)
    }
  }
}

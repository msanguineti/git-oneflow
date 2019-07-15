/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { exec } from 'shelljs'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { Arguments, CommandModule } from 'yargs'
import { isValidBranchName } from '../../core'

export class StartRelease implements CommandModule {
  public command: string = 'start <releaseName> <from>'

  public describe: string = `Start a new release.
  <releaseName> should be something like \`2.3.0\`.
  <from> should be a branch (e.g. develop) or a commit (e.g. 9af345)`

  public handler = (argv: Arguments): void => {
    if (
      isValidBranchName(argv.releaseName) &&
      (argv.from ? isValidBranchName(argv.from) : true)
    ) {
      exec(`git checkout -b ${argv.release}/${argv.releaseName} ${argv.from}`)
    }
  }
}

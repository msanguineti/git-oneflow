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
import { Arguments, CommandModule } from 'yargs'

export class StartHotfix implements CommandModule {
  public command: string = 'start <hotfixName> <from>'

  public describe: string = `Start a new hotfix.
  <hotfixName> should be something like \`2.3.1\`.
  <from> should be a branch (e.g. develop), a tag (e.g. 2.3.0) or a commit (e.g. 9af345)`

  public handler = (argv: Arguments): void => {
    if (
      isValidBranchName(argv.hotfixName) &&
      (argv.from ? isValidBranchName(argv.from) : true)
    ) {
      exec(`git checkout -b ${argv.hotfix}/${argv.hotfixName} ${argv.from}`)
    }
  }
}

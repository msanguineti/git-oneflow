/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import { exec } from 'shelljs'
import { isValidBranchName } from '../../core'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { Arguments, CommandModule } from 'yargs'

export class StartFeature implements CommandModule {
  public command = 'start <featureBranch>'

  public describe = 'Start a new feature'

  public handler = (argv: Arguments) => {
    const branchOff = argv.usedev ? argv.development : argv.main

    if (isValidBranchName(argv.featureBranch)) {
      exec(`git checkout -b ${argv.feature}/${argv.featureBranch} ${branchOff}`)
    }
  }
}

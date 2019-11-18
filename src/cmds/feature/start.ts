/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import { exec } from 'shelljs'
import { Arguments, CommandModule } from 'yargs'
import { isValidBranchName } from '../../core'

export class StartFeature implements CommandModule {
  public command: string = 'start <featureBranch>'

  public describe: string = 'Start a new feature'

  public handler = (argv: Arguments) => {
    const branchOff = argv.usedev ? argv.development : argv.main

    if (
      isValidBranchName(argv.featureBranch) &&
      (branchOff ? isValidBranchName(branchOff) : true)
    ) {
      exec(`git checkout -b ${argv.feature}/${argv.featureBranch} ${branchOff}`)
    }
  }
}

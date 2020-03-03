/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import { exec } from 'shelljs'
import { Arguments, CommandModule } from 'yargs'
import { isValidBranchName, loadConfigFile } from '../../core'

export class StartFeature implements CommandModule {
  public command = 'start <featureBranch>'

  public describe = 'Start a new feature'

  public handler: (argv: {
    [argName: string]: unknown
    _: string[]
    $0: string
  }) => void = (argv: Arguments) => {
    if (argv.c) loadConfigFile(argv.c as string)

    const branchOff = argv.usedev ? argv.development : argv.main

    if (
      isValidBranchName(argv.featureBranch) &&
      (branchOff ? isValidBranchName(branchOff) : true)
    ) {
      exec(`git checkout -b ${argv.feature}/${argv.featureBranch} ${branchOff}`)
    }
  }
}

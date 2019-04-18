import { exec } from 'shelljs'
import { isValidBranchName } from '../core'

/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export default {
  command: 'start <featureBranch>',
  desc: 'Start a new feature',
  builder: (yargs: any) => {},
  handler: (argv: { [key: string]: any }) => {
    const branchOff = argv.usedev ? argv.development : argv.main

    if (isValidBranchName(argv.featureBranch)) {
      exec(`git checkout -b ${argv.feature}/${argv.featureBranch} ${branchOff}`)
    }
  }
}

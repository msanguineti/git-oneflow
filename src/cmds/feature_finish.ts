// import { isValidBranchName } from '../core'
import { exec } from 'shelljs'

/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export default {
  command: 'finish <featureBranch> [options]',
  desc: 'Finish a feature',
  builder: (yargs: any) => {
    return yargs.option('i', {
      alias: 'interactive',
      describe:
        'Rebase using `rebase -i`. It applies only if `integration` option is set to 1 or 3'
    })
  },
  handler: (argv: { [key: string]: any }) => {
    const branchOff = argv.usedev ? argv.development : argv.main

    // if (isValidBranchName(argv.feature, argv.featureBranch, branchOff)) {
    exec(`git checkout -b ${argv.feature}/${argv.featureBranch} ${branchOff}`)
    // }
  }
}

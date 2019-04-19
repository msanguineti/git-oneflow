/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import start from './hotfix/start'
import finish from './hotfix/finish'

export default {
  command: 'hotfix <command>',
  desc: 'Manage starting and finishing hotfixes.',
  builder: function (yargs: any) {
    return yargs.command(start).command(finish)
  },
  handler: function (argv: { [key: string]: any }) {}
}

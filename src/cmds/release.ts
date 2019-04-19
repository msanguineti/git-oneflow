/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import start from './release/start'
import finish from './release/finish'

export default {
  command: 'release <command>',
  desc: 'Manage starting and finishing releases.',
  builder: function (yargs: any) {
    return yargs.command(start).command(finish)
  },
  handler: function (argv: { [key: string]: any }) {}
}

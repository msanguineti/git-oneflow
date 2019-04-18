/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import start from './feature_start'
import finish from './feature_finish'

export default {
  command: 'feature <command>',
  desc: 'Manage starting and finishing features',
  builder: function (yargs: any) {
    return yargs.command(start).command(finish)
  },
  handler: function (argv: { [key: string]: any }) {}
}

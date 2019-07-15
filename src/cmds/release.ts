/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import StartRelease from './release/start'
import FinishRelease from './release/finish'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { CommandModule, Argv } from 'yargs'

export default class Release implements CommandModule {
  command = 'release <command>'

  desc = 'Manage starting and finishing releases.'

  builder = function (yargs: Argv) {
    return yargs.command(new StartRelease()).command(new FinishRelease())
  }

  handler = () => {}
}

/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { StartRelease } from './release/start'
import { FinishRelease } from './release/finish'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { CommandModule, Argv } from 'yargs'

export class Release implements CommandModule {
  public command = 'release <command>'

  public describe = 'Manage starting and finishing releases.'

  public builder = (yargs: Argv) => {
    return yargs.command(new StartRelease()).command(new FinishRelease())
  }

  public handler = () => {}
}

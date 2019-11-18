/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Argv, CommandModule } from 'yargs'
import { FinishRelease } from './release/finish'
import { StartRelease } from './release/start'

export class Release implements CommandModule {
  public command: string = 'release <command>'

  public describe: string = 'Manage starting and finishing releases.'

  public builder = (yargs: Argv): Argv => {
    return yargs
      .option('c', {
        alias: 'config',
        type: 'string',
        description: 'Config file to use'
      })
      .command(new StartRelease())
      .command(new FinishRelease())
  }

  public handler = (): void => {}
}

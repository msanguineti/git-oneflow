/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { Argv, CommandModule } from 'yargs'
import { FinishRelease } from './release/finish'
import { StartRelease } from './release/start'

export class Release implements CommandModule {
  public command: string = 'release <command>'

  public describe: string = 'Manage starting and finishing releases.'

  public builder = (yargs: Argv): Argv => {
    return yargs.command(new StartRelease()).command(new FinishRelease())
  }

  public handler = (): void => {}
}

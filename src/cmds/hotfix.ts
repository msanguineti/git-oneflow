/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { Argv, CommandModule } from 'yargs'
import { FinishHotfix } from './hotfix/finish'
import { StartHotfix } from './hotfix/start'

export class Hotfix implements CommandModule {
  public command: string = 'hotfix <command>'

  public describe: string = 'Manage starting and finishing hotfixes.'

  public builder = (yargs: Argv): Argv => {
    return yargs.command(new StartHotfix()).command(new FinishHotfix())
  }

  public handler = (): void => {}
}

/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Argv, CommandModule } from 'yargs'
import { FinishHotfix } from './hotfix/finish'
import { StartHotfix } from './hotfix/start'

export class Hotfix implements CommandModule {
  public command = 'hotfix <command>'

  public describe = 'Manage starting and finishing hotfixes.'

  public builder = (yargs: Argv): Argv => {
    return yargs
      .option('c', {
        alias: 'config',
        type: 'string',
        description: 'Config file to use'
      })
      .command(new StartHotfix())
      .command(new FinishHotfix())
  }

  public handler = (): void => {
    //do nothing
  }
}

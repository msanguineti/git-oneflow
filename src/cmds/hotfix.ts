/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { StartHotfix } from './hotfix/start'
import { FinishHotfix } from './hotfix/finish'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { CommandModule, Argv } from 'yargs'

export class Hotfix implements CommandModule {
  public command: string = 'hotfix <command>'

  public describe: string = 'Manage starting and finishing hotfixes.'

  public builder = (yargs: Argv): Argv => {
    return yargs.command(new StartHotfix()).command(new FinishHotfix())
  }

  public handler = (): void => {}
}

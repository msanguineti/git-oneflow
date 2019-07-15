/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import StartHotfix from './hotfix/start'
import FinishHotfix from './hotfix/finish'
/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { CommandModule, Argv } from 'yargs'

export default class Hotfix implements CommandModule {
  command = 'hotfix <command>'

  describe = 'Manage starting and finishing hotfixes.'

  builder = (yargs: Argv) => {
    return yargs.command(new StartHotfix()).command(new FinishHotfix())
  }

  handler = () => {}
}

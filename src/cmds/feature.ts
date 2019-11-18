/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Argv, CommandModule } from 'yargs'
import { FinishFeature } from './feature/finish'
import { StartFeature } from './feature/start'

export class Feature implements CommandModule {
  public command: string = 'feature <command>'

  public describe: string = 'Manage starting and finishing features'

  public builder = (yargs: Argv): Argv => {
    return yargs
      .option('c', {
        alias: 'config',
        type: 'string',
        description: 'Config file to use'
      })
      .command(new StartFeature())
      .command(new FinishFeature())
  }

  public handler = () => {}
}

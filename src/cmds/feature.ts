/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable no-unused-vars */
/* eslint-enable @typescript-eslint/no-unused-vars */
import { Argv, CommandModule } from 'yargs'
import { FinishFeature } from './feature/finish'
import { StartFeature } from './feature/start'

export class Feature implements CommandModule {
  public command: string = 'feature <command>'

  public describe: string = 'Manage starting and finishing features'

  public builder = (yargs: Argv): Argv => {
    return yargs.command(new StartFeature()).command(new FinishFeature())
  }

  public handler = (): void => {}
}

import program from 'commander'
import * as packageJson from '../package.json'
import makeFinishCmd from './cmds/finish'
import makeInitCmd from './cmds/init'
import makeStartCmd from './cmds/start'
import * as config from './lib/config'
import * as log from './lib/log'

const main = async (): Promise<void> => {
  config.load()

  program
    .name(packageJson.name)
    .version(packageJson.version)
    .addCommand(makeStartCmd())
    .addCommand(makeFinishCmd())
    .addCommand(makeInitCmd())

  await program.parseAsync()
}

main().catch((err) => log.error(err))

import program from 'commander'
import * as pkg from '../package.json'
import makeFinishCmd from './cmds/finish'
import makeInitCmd from './cmds/init'
import makeStartCmd from './cmds/start'
import * as config from './lib/config'
import * as git from './lib/git'
import * as log from './lib/log'

const main = async (): Promise<void> => {
  if (!git.isOK())
    throw new Error('git not installed or not in a valid git repository')

  config.load()

  program
    .name(pkg.name)
    .version(pkg.version)
    .addCommand(makeStartCmd())
    .addCommand(makeFinishCmd())
    .addCommand(makeInitCmd())

  await program.parseAsync()
}

main().catch((err) => log.error(err))

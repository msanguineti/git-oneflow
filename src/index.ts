import { Command } from 'commander'
import { name, version } from '../package.json'
import makeFinishCmd from './cmds/finish'
import makeInitCmd from './cmds/init'
import makeStartCmd from './cmds/start'
import { load } from './lib/config'
import { isOK } from './lib/git'
import { error } from './lib/log'

const main = async (): Promise<void> => {
  if (!isOK())
    throw new Error('git not installed or not in a valid git repository')

  load()

  const program = new Command()

  program
    .name(name)
    .version(version)
    .addCommand(makeStartCmd())
    .addCommand(makeFinishCmd())
    .addCommand(makeInitCmd())

  await program.parseAsync()
}

main().catch((err) => error(err))

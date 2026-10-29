import { Command } from 'commander'
import path from 'path'
import { name, version } from '../package.json'
import makeFinishCmd from './cmds/finish'
import makeInitCmd from './cmds/init'
import makeStartCmd from './cmds/start'
import { load } from './lib/config'
import { isOK } from './lib/git'
import { error } from './lib/log'

const main = async (): Promise<void> => {
  try {
    const program = new Command()

    program
      .name(name)
      .version(version)
      .addCommand(makeStartCmd())
      .addCommand(makeFinishCmd())
      .addCommand(makeInitCmd())
      .hook('preAction', (_command, actionCommand) => {
        const file = actionCommand.opts().config as string | undefined
        load(file ? path.resolve(file) : undefined)
        if (!isOK())
          throw new Error('git not installed or not in a valid git repository')
      })

    await program.parseAsync()
  } catch (err) {
    error(err as Error)
    process.exitCode = 1
  }
}

main()

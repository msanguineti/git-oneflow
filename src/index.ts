#!/usr/bin/env node
import { Command } from 'commander'
import path from 'path'
import { name, version } from './lib/package.js'
import makeFinishCmd from './cmds/finish.js'
import makeInitCmd from './cmds/init.js'
import makeStartCmd from './cmds/start.js'
import { load } from './lib/config.js'
import { isOK } from './lib/git.js'
import { error } from './lib/log.js'

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

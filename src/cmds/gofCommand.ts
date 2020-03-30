import commander, { Command } from 'commander'
import path from 'path'
import * as config from '../lib/config'
import * as log from '../lib/log'

export type GofCmdOption = {
  flags: string
  desc: string
  defaultValue?: string | boolean
}

export type GofCommand = {
  name: string
  args?: string
  desc?: [string, { [key: string]: string }?]
  opts?: GofCmdOption[]
  listeners?: {
    event: string | symbol
    callback: (...args: (string | boolean | undefined)[]) => void
  }[]
  action?: (...args: unknown[]) => void | Promise<void>
  examples?: string[]
}

export const makeGofCmd = ({
  name,
  args,
  desc,
  opts,
  listeners,
  action,
  examples,
}: GofCommand): commander.Command => {
  const cmd = new commander.Command(name)

  cmd
    .option('-c, --config <file>', 'configuration file to use')
    .on('option:config', (file) => {
      config.load(path.resolve(file))
    })
    .option('--dry-run', 'just show which commands would be run')
    .on('option:dry-run', () => {
      process.env.GOF_CHICKENOUT = 'true'
    })
    .option(
      '-b, --base <name>',
      `override the current base branch name: '${config.getBaseBranch(
        cmd._name
      )}'`
    )
    .option('--no-base', 'do not use a base branch name')
    .option('--debug')
    .on('option:debug', () =>
      log.info('debug', JSON.stringify(cmd.opts(), null, 2))
    )

  cmd.alias(name.charAt(0))

  if (args) cmd.arguments(args)

  if (desc) cmd.description(...desc)

  if (opts) {
    opts.forEach((opt) => {
      cmd.option(opt.flags, opt.desc, opt.defaultValue)
    })
  }

  if (listeners) {
    listeners.forEach((listener) => {
      cmd.on(listener.event, listener.callback)
    })
  }

  if (action) {
    cmd.action(action)
  }

  if (examples) {
    cmd.on('--help', function () {
      console.log('')
      console.log('Examples:')
      console.log('')
      console.log('  '.concat(examples.join('\n  ')))
    })
  }

  return cmd
}

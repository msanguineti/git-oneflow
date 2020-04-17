import chalk from 'chalk'

export const info = (key: string, msg: unknown): void => {
  console.info(`${chalk.grey(key)}: ${chalk.cyan(msg)}`)
}

export const error = (msg: string | Error): void => {
  console.error(
    `${chalk.red('error')}: ${chalk.white(
      msg instanceof Error ? msg.message : msg
    )}`
  )
  if (process.env.DEBUG && msg instanceof Error) console.error(msg)
}

export const warning = (msg: string | Error): void => {
  console.warn(
    `${chalk.yellow('warning')}: ${chalk.white(
      msg instanceof Error ? msg.message : msg
    )}`
  )
  if (process.env.DEBUG && msg instanceof Error) console.error(msg)
}

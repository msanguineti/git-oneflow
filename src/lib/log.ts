import fude from 'fude'

export const info = (key: string, msg: unknown): void => {
  console.info(`${fude.gray(key)}: ${fude.cyan(msg)}`)
}

export const error = (msg: string | Error): void => {
  console.error(
    `${fude.red('error')}: ${fude.white(
      msg instanceof Error ? msg.message : msg
    )}`
  )
  if (process.env.DEBUG && msg instanceof Error) console.error(msg)
}

export const warning = (msg: string | Error): void => {
  console.warn(
    `${fude.yellow('warning')}: ${fude.white(
      msg instanceof Error ? msg.message : msg
    )}`
  )
  if (process.env.DEBUG && msg instanceof Error) console.error(msg)
}

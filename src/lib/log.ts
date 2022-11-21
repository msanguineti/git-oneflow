import { cyan, gray, red, white, yellow } from 'fude'

export const info = (key: string, msg: string): void => {
  console.info(`${gray(key)}: ${cyan(msg)}`)
}

export const error = (msg: string | Error): void => {
  console.error(
    `${red('error')}: ${white(msg instanceof Error ? msg.message : msg)}`
  )
  if (process.env.DEBUG && msg instanceof Error) console.error(msg)
}

export const warning = (msg: string | Error): void => {
  console.warn(
    `${yellow('warning')}: ${white(msg instanceof Error ? msg.message : msg)}`
  )
  if (process.env.DEBUG && msg instanceof Error) console.error(msg)
}

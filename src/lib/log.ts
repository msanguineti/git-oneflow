import { styleText } from 'node:util'

const cyan = (text: string) => styleText('cyan', text)
const gray = (text: string) => styleText('gray', text)
const red = (text: string) => styleText('red', text, { stream: process.stderr })
const white = (text: string) =>
  styleText('white', text, { stream: process.stderr })
const yellow = (text: string) =>
  styleText('yellow', text, { stream: process.stderr })

export const info = (key: string, msg: string): void => {
  console.info(`${gray(key)}: ${cyan(msg)}`)
}

export const error = (msg: string | Error): void => {
  console.error(
    `${red('error')}: ${white(msg instanceof Error ? msg.message : msg)}`,
  )
  if (process.env.DEBUG && msg instanceof Error) console.error(msg)
}

export const warning = (msg: string | Error): void => {
  console.warn(
    `${yellow('warning')}: ${white(msg instanceof Error ? msg.message : msg)}`,
  )
  if (process.env.DEBUG && msg instanceof Error) console.error(msg)
}

import { readFileSync } from 'node:fs'

const metadata = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as { name: string; version: string }

export const { name, version } = metadata

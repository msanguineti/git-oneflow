import * as shelljs from 'shelljs'

export default async (): Promise<void> => {
  const glb = global as NodeJS.Global & { __STASHED__: boolean }

  if (glb.__STASHED__) shelljs.exec('git stash pop', { silent: true })
}

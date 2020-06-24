import * as shelljs from 'shelljs'

export default async (): Promise<void> => {
  if (
    shelljs.exec('git diff HEAD --name-only', { silent: true }).stdout !== ''
  ) {
    shelljs.exec('git stash push -u', { silent: true })

    const glbl = global as NodeJS.Global &
      typeof globalThis & { __STASHED__: boolean }

    glbl.__STASHED__ = true
  }

  if (!shelljs.test('-e', 'bin/cli'))
    shelljs.exec('npm run build', { silent: true })
}

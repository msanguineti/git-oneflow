import shelljs from 'shelljs'
const { exec, test } = shelljs

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      __STASHED__: boolean
    }
  }
}

export default async (): Promise<void> => {
  if (exec('git diff HEAD --name-only', { silent: true }).stdout !== '') {
    exec('git stash push -u', { silent: true })

    const glbl = global as NodeJS.Global &
      typeof globalThis & { __STASHED__: boolean }

    glbl.__STASHED__ = true
  }

  if (!test('-e', 'bin/cli.js')) exec('npm run build', { silent: true })
}

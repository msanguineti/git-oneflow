import shelljs from 'shelljs'
const { exec } = shelljs

export default async (): Promise<void> => {
  const glb = global as NodeJS.Global &
    typeof globalThis & { __STASHED__: boolean }

  if (glb.__STASHED__) exec('git stash pop', { silent: true })
}

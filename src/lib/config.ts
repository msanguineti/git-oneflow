import { cosmiconfigSync } from 'cosmiconfig'
import { name } from '../../package.json'

const explorer = cosmiconfigSync(name)

let configFile: string | undefined

export type StrategyOptions = 'rebase' | 'no-ff' | 'rebase-no-ff'

type Configuration = {
  main: string
  development: string | undefined
  features: string
  releases: string
  hotfixes: string
  strategy: StrategyOptions
  interactive: boolean
  deleteAfterMerge: boolean
  pushAfterMerge: boolean
  tagCommit: boolean
  askOnFeatureStart: boolean
  askOnFeatureFinish: boolean
}

export const strategyOptionValues: StrategyOptions[] = [
  'rebase',
  'no-ff',
  'rebase-no-ff',
]

export const defaultConfiguration: Configuration = {
  main: 'main',
  development: undefined,
  features: 'feature',
  releases: 'release',
  hotfixes: 'hotfix',
  strategy: 'rebase',
  interactive: true,
  deleteAfterMerge: true,
  pushAfterMerge: true,
  tagCommit: true,
  askOnFeatureStart: false,
  askOnFeatureFinish: false,
}

export const optionNames = Object.keys(defaultConfiguration)
  .filter((key) => Object.hasOwn(defaultConfiguration, key))
  .reduce((a: { [key: string]: string }, v: string) => {
    a[v] = v
    return a
  }, {}) as { [key in keyof Configuration]: string }

export const load = (file?: string): void => {
  const result = file ? explorer.load(file) : explorer.search()

  configFile = result?.filepath

  const gofConfig = { ...defaultConfiguration, ...result?.config }

  for (const key in gofConfig) {
    if (Object.hasOwn(defaultConfiguration, key)) {
      const value = gofConfig[key]

      if (value) process.env[`gof_${key}`.toUpperCase()] = value
    } else {
      throw new Error(
        `unknown configuration option ${key} in ${result?.filepath}`,
      )
    }
  }
}

export const getConfigFile = (): string | undefined => configFile

export const getConfigValue = (key: keyof Configuration): string | undefined =>
  process.env[`gof_${key}`.toUpperCase()]

export const getDefaultValue = (
  key: keyof Configuration,
): string | boolean | undefined => defaultConfiguration[key]

export const getBaseBranch = (cmd: string): string | undefined => {
  switch (cmd) {
    case 'feature':
      return getConfigValue('features')
    case 'release':
      return getConfigValue('releases')
    case 'hotfix':
      return getConfigValue('hotfixes')
  }
}

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

let configuration: Configuration = { ...defaultConfiguration }

export const load = (file?: string): void => {
  explorer.clearCaches()
  const result = file ? explorer.load(file) : explorer.search()
  if (file && !result) throw new Error(`configuration file not found: ${file}`)
  const values = result?.config ?? {}
  if (typeof values !== 'object' || values === null || Array.isArray(values))
    throw new Error('configuration must be an object')
  for (const [key, value] of Object.entries(values)) {
    if (!Object.hasOwn(defaultConfiguration, key))
      throw new Error(
        `unknown configuration option ${key} in ${result?.filepath}`,
      )
    const expected = defaultConfiguration[key as keyof Configuration]
    const type = key === 'development' ? 'string' : typeof expected
    if (typeof value !== type)
      throw new Error(
        `invalid type for configuration option ${key}: expected ${type}`,
      )
    if (
      key === 'strategy' &&
      !strategyOptionValues.includes(value as StrategyOptions)
    )
      throw new Error(`unknown strategy option: ${value}`)
  }
  configuration = { ...defaultConfiguration, ...values }
  configFile = result?.filepath
}

export const getConfigFile = (): string | undefined => configFile

export const getConfigValue = <K extends keyof Configuration>(
  key: K,
): Configuration[K] => configuration[key]

export const getDefaultValue = <K extends keyof Configuration>(
  key: K,
): Configuration[K] => defaultConfiguration[key]

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

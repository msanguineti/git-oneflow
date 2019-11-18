import * as core from '../src/core'
import sh from 'shelljs'

describe('testing core functionalities', () => {
  describe('config', () => {
    let tempConfigFile: string

    test('default config values are defined', () => {
      const defaults: core.ConfigValues = core.getDefaultConfigValues()

      expect(defaults).toBeDefined()
    })
    test('default config values contain values', () => {
      const defaults: core.ConfigValues = core.getDefaultConfigValues()

      expect(defaults.main).toMatch('master')
      expect(defaults.usedev).not.toBeTruthy()
      expect(defaults.integration).toEqual(1)
    })

    test('throw if no config file is found', () => {
      expect(() => core.loadConfigFile()).toThrow(/Cannot load/)
    })

    test('load default values if no default config files are found', () => {
      const defaults = core.loadConfigValues()

      expect(defaults.main).toMatch('master')
      expect(defaults.usedev).not.toBeTruthy()
      expect(defaults.integration).toEqual(1)
    })

    test('write default config file', () => {
      core.writeConfigFile({})

      expect(sh.test('-f', 'gof.config.js')).toBeTruthy()
      sh.rm('gof.config.js')
    })

    test('write to config file', () => {
      tempConfigFile = sh.tempdir() + '/gof.test.config.json'

      core.writeConfigFile({
        file: tempConfigFile,
        data: { hotfix: 'hotfix' }
      })

      expect(sh.test('-f', tempConfigFile)).toBeTruthy()
    })

    test('load config values from file', () => {
      const defaults = core.loadConfigFile(tempConfigFile)

      expect(defaults).toBeDefined()
      expect(defaults.hotfix).toMatch('hotfix')
    })

    test('throw because config value from file is wrong', () => {
      sh.ShellString(
        `{
      "development": "asldk  /.. ,./3"
      }`
      ).to(tempConfigFile)

      expect(() => core.loadConfigFile(tempConfigFile)).toThrow(/development/)
    })

    test('write to (and load from) .js file', () => {
      const jsFile = sh.tempdir() + '/gof.config.js'

      core.writeConfigFile({
        file: jsFile,
        data: { development: 'develop', tags: false }
      })

      expect(sh.test('-f', jsFile)).toBeTruthy()

      const jsObject = core.loadConfigFile(jsFile)

      expect(jsObject.development).toMatch('develop')
      expect(jsObject.tags).toBeFalsy()
    })

    test('attempt to write to wrong file type', () => {
      const wrong = core.writeConfigFile({ file: 'file.wrong' })

      expect(wrong).not.toBeTruthy()
    })

    test('config value for a branch name is invalid', () => {
      expect(() =>
        core.writeConfigFile({
          data: { development: 'akn//&&svn...#k/' }
        })
      ).toThrow(/development/)
    })

    test('config value usedev is invalid', () => {
      expect(() =>
        core.writeConfigFile({
          data: { usedev: 'true' }
        })
      ).toThrow(/usedev/)
    })

    test('config value push is invalid', () => {
      expect(() =>
        core.writeConfigFile({
          data: { push: 'maybe' }
        })
      ).toThrow(/push/)
    })

    test('config value integration is invalid', () => {
      expect(() =>
        core.writeConfigFile({
          data: { integration: 4 }
        })
      ).toThrow(/integration/)
    })
  })

  describe('git', () => {
    test('the branch name is valid', () => {
      expect(core.isValidBranchName('branch/name')).toBeTruthy()
    })

    test('the branch name is invalid', () => {
      expect(core.isValidBranchName('branch///dkd/.kdk,.l')).not.toBeTruthy()
    })

    test('the tag name is valid', () => {
      expect(core.isValidTagName('v1.2.3')).toBeTruthy()
    })

    test('the tag name is invalid', () => {
      expect(core.isValidTagName('1...3.4.5')).not.toBeTruthy()
    })
  })
})

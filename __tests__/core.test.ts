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

    test('load default values if no config files - part I', () => {
      const defaults = core.loadConfigFile()

      expect(defaults.main).toMatch('master')
      expect(defaults.usedev).not.toBeTruthy()
      expect(defaults.integration).toEqual(1)
    })

    test('load default values if no config files - part II', () => {
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
        data: { test: 'test value' }
      })

      expect(sh.test('-f', tempConfigFile)).toBeTruthy()
    })

    test('load config values from file', () => {
      const defaults = core.loadConfigFile(tempConfigFile)

      expect(defaults).toBeDefined()
      expect(defaults.test).toMatch('test value')
    })

    test('write to (and load from) .js file', () => {
      const jsFile = sh.tempdir() + '/gof.config.js'

      core.writeConfigFile({
        file: jsFile,
        data: { development: 'develop', test: true }
      })

      expect(sh.test('-f', jsFile)).toBeTruthy()

      const jsObject = core.loadConfigFile(jsFile)

      expect(jsObject.development).toMatch('develop')
      expect(jsObject.test).toBeTruthy()
    })

    test('attemp to write to wrong file type', () => {
      const wrong = core.writeConfigFile({ file: 'file.wrong' })

      expect(wrong).not.toBeTruthy()
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
      expect(core.isValidTagName('1.2.3')).toBeTruthy()
    })
    test('the tag name is invalid', () => {
      expect(core.isValidTagName('1...3.4.5')).not.toBeTruthy()
    })
  })
})

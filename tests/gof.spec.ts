import shelljs from 'shelljs'
import { version } from '../package.json'
import {
  branchExists,
  checkoutBranch,
  createBranch,
  deleteBranch,
  getCurrentBranch,
  getLatestTag,
} from '../src/lib/git'
import yoda from '../src/lib/yoda'

const { exec, rm, test } = shelljs

const SILENT = process.env.SILENT === undefined || process.env.SILENT === 'true'

describe('Prepare test environemnt', () => {
  const testBranch = 'testBranch'
  let currentBranch: string

  beforeAll(() => {
    currentBranch = getCurrentBranch()
    createBranch(testBranch)
  })

  it('checks test branch exists', () => {
    expect(branchExists(testBranch)).toBe(true)
  })

  describe('Program transpiled correctly', () => {
    it('is transpiled', () => {
      expect(test('-e', 'bin/cli.js')).toBe(true)
    })

    it('returns the version', () => {
      const shellString = exec('node bin/cli.js -V', {
        silent: SILENT,
      })

      expect(shellString.stdout).toMatch(version)
    })
  })

  describe('Init command', () => {
    beforeAll(() => {
      if (test('-e', '.git-oneflowrc')) rm('.git-oneflowrc')
    })

    it('creates default config file', () => {
      const shellString = exec('node bin/cli.js init -y', {
        silent: SILENT,
      })

      expect(shellString.stdout).toContain(
        'config: new configuration file created',
      )
      expect(test('-e', '.git-oneflowrc')).toBe(true)
    })

    it('refuses to create a config file', () => {
      const shellString = exec('node bin/cli.js init -y', {
        silent: SILENT,
      })

      expect(shellString.stderr).toContain('warning: a configuration exists')
    })

    it('summons yoda', () => {
      const shellString = exec('node bin/cli.js init -y -f', {
        silent: SILENT,
      })

      expect(shellString.stdout).toContain(yoda)
    })

    afterAll(() => {
      rm('.git-oneflowrc')
    })
  })

  describe('Start/Finish commands', () => {
    const featureBranch = 'featureBranch'
    const releaseBranch = 'releaseBranch'
    const hotfixBranch = 'hotfixBranch'

    const featureName = 'my-feature'
    const releaseName = 'my-release'
    const hotfixName = 'my-hotfix'

    it('shows default help', () => {
      const shellString = exec('node bin/cli.js start', {
        silent: SILENT,
      })

      expect(shellString.stderr).toContain('Usage: git-oneflow start|s')
    })

    it('shows help on demand', () => {
      const shellString = exec('node bin/cli.js start -h', {
        silent: SILENT,
      })

      expect(shellString.stdout).toContain('Usage: git-oneflow start|s')
    })

    it('shows suggestion if command is mistyped', () => {
      const shellString = exec('node bin/cli.js strat', {
        silent: SILENT,
      })

      expect(shellString.stderr).toContain('(Did you mean start?)')
    })

    it('starts a feature', () => {
      const shellString = exec(
        `node bin/cli.js s f -b ${featureBranch} -r ${testBranch} ${featureName}`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          `dry-run: git checkout -b ${featureBranch}/${featureName} ${testBranch}`,
        )
      else {
        expect(getCurrentBranch()).toMatch(`${featureBranch}/${featureName}`)
      }
    })

    it('finishes a feature', () => {
      const shellString = exec(
        `node bin/cli.js f f -o ${testBranch} ${featureName} -b ${featureBranch} --no-delete --no-interactive --no-push`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          `dry-run: git status\n` +
            `dry-run: git checkout ${featureBranch}/${featureName}\n` +
            `dry-run: git rebase ${testBranch}\n` +
            `dry-run: git checkout ${testBranch}\n` +
            `dry-run: git merge --ff-only ${featureBranch}/${featureName}`,
        )
      else {
        expect(branchExists(`${featureBranch}/${featureName}`)).toBe(true)
        expect(getCurrentBranch()).toMatch(testBranch)
        deleteBranch(`${featureBranch}/${featureName}`)
      }
    })

    it('fails to start a feature', () => {
      const noBranch = 'no-branch'
      const shellString = exec(
        `node bin/cli.js s f ${featureName} -r ${noBranch} -b ${featureBranch}`,
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          `dry-run: git checkout -b ${featureBranch}/${featureName} ${noBranch}`,
        )
      else
        expect(shellString.stderr).toMatch(
          `error: fatal: '${noBranch}' is not a commit and a branch '${featureBranch}/${featureName}' cannot be created from it`,
        )
    })

    it('starts a release', () => {
      const shellString = exec(
        `node bin/cli.js s r -b ${releaseBranch} -r ${testBranch} ${releaseName}`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          `dry-run: git checkout -b ${releaseBranch}/${releaseName} ${testBranch}`,
        )
      else {
        expect(getCurrentBranch()).toMatch(`${releaseBranch}/${releaseName}`)
      }
    })

    it('finishes a release', () => {
      const tag = '41.41.41'
      const shellString = exec(
        `node bin/cli.js f r -o ${testBranch} ${releaseName} -b ${releaseBranch} --no-delete --no-push -t ${tag} -m 'chore(release) ${tag}'`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          `dry-run: git status\n` +
            `dry-run: git checkout ${releaseBranch}/${releaseName}\n` +
            `dry-run: git tag -a -m 'chore(release) ${tag}' ${tag}\n` +
            `dry-run: git checkout ${testBranch}\n` +
            `dry-run: git merge ${releaseBranch}/${releaseName}`,
        )
      else {
        expect(branchExists(`${releaseBranch}/${releaseName}`)).toBe(true)
        expect(getCurrentBranch()).toMatch(testBranch)
        expect(getLatestTag()).toMatch(tag)
        exec(`git tag -d ${tag}`)
        deleteBranch(`${releaseBranch}/${releaseName}`)
      }
    })

    it('starts a hotfix', () => {
      const shellString = exec(
        `node bin/cli.js s h -b${hotfixBranch} -r ${testBranch} ${hotfixName}`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          `dry-run: git checkout -b ${hotfixBranch}/${hotfixName} ${testBranch}`,
        )
      else {
        expect(getCurrentBranch()).toMatch(`${hotfixBranch}/${hotfixName}`)
      }
    })

    it('finishes a hotfix', () => {
      const tag = '42.42.42'
      const shellString = exec(
        `node bin/cli.js f h -o ${testBranch} ${hotfixName} -b ${hotfixBranch} --no-delete --no-push -t ${tag} -m 'chore(release) ${tag}'`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          `dry-run: git status\n` +
            `dry-run: git checkout ${hotfixBranch}/${hotfixName}\n` +
            `dry-run: git tag -a -m 'chore(release) ${tag}' ${tag}\n` +
            `dry-run: git checkout ${testBranch}\n` +
            `dry-run: git merge ${hotfixBranch}/${hotfixName}`,
        )
      else {
        expect(branchExists(`${hotfixBranch}/${hotfixName}`)).toBe(true)
        expect(getCurrentBranch()).toMatch(testBranch)
        expect(getLatestTag()).toMatch(tag)
        exec(`git tag -d ${tag}`)
        deleteBranch(`${hotfixBranch}/${hotfixName}`)
      }
    })
  })

  afterAll(() => {
    checkoutBranch(currentBranch)
    deleteBranch(testBranch)
  })
})

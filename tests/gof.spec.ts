import { version } from '../package.json'
import yoda from '../src/lib/yoda'
import {
  getCurrentBranch,
  createBranch,
  branchExists,
  deleteBranch,
  getLatestTag,
  checkoutBranch,
} from '../src/lib/git'
import shelljs from 'shelljs'

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
        `node bin/cli.js s f -r ${testBranch} ${featureName}`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          'dry-run: git checkout -b feature/my-feature testBranch',
        )
      else {
        expect(getCurrentBranch()).toMatch(`feature/${featureName}`)
      }
    })

    it('finishes a feature', () => {
      const shellString = exec(
        `node bin/cli.js f f -o ${testBranch} ${featureName} --no-delete --no-interactive --no-push`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          'dry-run: git checkout feature/my-feature' +
            '\n' +
            'dry-run: git rebase testBranch' +
            '\n' +
            'dry-run: git checkout testBranch' +
            '\n' +
            'dry-run: git merge --ff-only feature/my-feature',
        )
      else {
        expect(branchExists(`feature/${featureName}`)).toBe(true)
        expect(getCurrentBranch()).toMatch(testBranch)
        deleteBranch(`feature/${featureName}`)
      }
    })

    it('fails to start a feature', () => {
      const noBranch = 'no-branch'
      const shellString = exec(
        `node bin/cli.js s f ${featureName} -r ${noBranch}`,
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          `dry-run: git checkout -b feature/${featureName} ${noBranch}`,
        )
      else
        expect(shellString.stderr).toMatch(
          `error: fatal: '${noBranch}' is not a commit and a branch 'feature/${featureName}' cannot be created from it`,
        )
    })

    it('starts a release', () => {
      const shellString = exec(
        `node bin/cli.js s r -r ${testBranch} ${releaseName}`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          'dry-run: git checkout -b release/my-release testBranch',
        )
      else {
        expect(getCurrentBranch()).toMatch(`release/${releaseName}`)
      }
    })

    it('finishes a release', () => {
      const tag = '41.41.41'
      const shellString = exec(
        `node bin/cli.js f r -o ${testBranch} ${releaseName} --no-delete --no-push -t ${tag} -m 'chore(release) ${tag}'`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          'dry-run: git checkout release/my-release' +
            '\n' +
            `dry-run: git tag -a -m 'chore(release) ${tag}' ${tag}` +
            '\n' +
            'dry-run: git checkout testBranch' +
            '\n' +
            'dry-run: git merge release/my-release',
        )
      else {
        expect(branchExists(`release/${releaseName}`)).toBe(true)
        expect(getCurrentBranch()).toMatch(testBranch)
        expect(getLatestTag()).toMatch(tag)
        exec(`git tag -d ${tag}`)
        deleteBranch(`release/${releaseName}`)
      }
    })

    it('starts a hotfix', () => {
      const shellString = exec(
        `node bin/cli.js s h -r ${testBranch} ${hotfixName}`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          'dry-run: git checkout -b hotfix/my-hotfix testBranch',
        )
      else {
        expect(getCurrentBranch()).toMatch(`hotfix/${hotfixName}`)
      }
    })

    it('finishes a hotfix', () => {
      const tag = '42.42.42'
      const shellString = exec(
        `node bin/cli.js f h -o ${testBranch} ${hotfixName} --no-delete --no-push -t ${tag} -m 'chore(release) ${tag}'`,
        {
          silent: SILENT,
        },
      )

      if (process.env.GOF_DRY_RUN)
        expect(shellString.stdout).toMatch(
          'dry-run: git checkout hotfix/my-hotfix' +
            '\n' +
            `dry-run: git tag -a -m 'chore(release) ${tag}' ${tag}` +
            '\n' +
            'dry-run: git checkout testBranch' +
            '\n' +
            'dry-run: git merge hotfix/my-hotfix',
        )
      else {
        expect(branchExists(`hotfix/${hotfixName}`)).toBe(true)
        expect(getCurrentBranch()).toMatch(testBranch)
        expect(getLatestTag()).toMatch(tag)
        exec(`git tag -d ${tag}`)
        deleteBranch(`hotfix/${hotfixName}`)
      }
    })
  })

  afterAll(() => {
    checkoutBranch(currentBranch)
    deleteBranch(testBranch)
  })
})

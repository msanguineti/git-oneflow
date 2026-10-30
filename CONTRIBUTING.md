# Contributing

The project is in maintenance mode. Contributions focus on bug fixes, security,
runtime support and maintainability; new features are not being added.

## Setup

Use the latest patch of a maintained Node.js LTS release (currently 22, 24 or 26)
or a newer non-EOL stable release. Current minimum patches are 22.23.4, 24.22.2
and 26.13.0.
`.nvmrc` selects the latest Node 22 patch. Install or update it with `nvm install`
before running `nvm use`. Git is required for the test suite.
Install locked dependencies with `npm ci`.

Keep supported lines on their latest patches and recheck the
[Node release schedule](https://nodejs.org/en/about/previous-releases) when
maintaining or releasing the project; drop lines once they reach end of life.

## Checks

Run these commands from the repository root:

```sh
npm run typecheck
npm run build
npm run lint
npm run format
npm test
npm run test:package
```

ESLint uses `eslint.config.js` for TypeScript source checks; generated `bin/` and
local `.dev/` records are excluded.

Tests create temporary Git repositories and clean them up afterward. The source
tests require a built CLI. The package check builds and installs a tarball in a
temporary directory, then checks its launchers and runs the CLI tests against it.
To check an existing tarball without repacking, run:

```sh
npm run test:package -- /path/to/package.tgz
```

Pull requests run the checks on Linux across supported LTS
lines and on macOS and Windows with the latest LTS. PRs also check one shared
tarball across that matrix using the release workflow.

## Pull requests

Create a short-lived branch from `main`, keep changes focused, and open a pull
request back to `main`. Use Conventional Commits; the commit hook checks commit
messages and formats staged files. Include relevant regression coverage and update
user documentation when behavior changes. The aggregate `checks` and `package-checks` jobs must pass
before integration; follow the repository's branch protection requirements.

For npm publishing, recovery and recurring maintenance tasks, see
[RELEASE.md](RELEASE.md).

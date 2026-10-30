# Contributing

The project is in maintenance mode. Contributions focus on bug fixes, security,
runtime support and maintainability; new features are not being added.

## Setup

Use a maintained Node.js LTS release (currently 22, 24 or 26; minimum 22.8.0).
`.nvmrc` selects Node 26. Git is required for the test suite.
Install locked dependencies with `npm ci`.

The package also supports newer non-EOL stable Node releases. Recheck the
[Node release schedule](https://nodejs.org/en/about/previous-releases) when
maintaining or releasing the project.

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

Tests create temporary Git repositories and clean them up afterward. The source
tests require a built CLI. The package check builds and installs a tarball in a
temporary directory, then checks its launchers and runs the CLI tests against it.
To check an existing tarball without repacking, run:

```sh
npm run test:package -- /path/to/package.tgz
```

Pull requests and pushes to `main` run the checks on Linux across supported LTS
lines and on macOS and Windows with the latest LTS. PRs also check one shared
tarball across that matrix using the release workflow.

## Pull requests

Create a short-lived branch from `main`, keep changes focused, and open a pull
request back to `main`. Use Conventional Commits; the commit hook checks commit
messages and formats staged files. Include relevant regression coverage and update
user documentation when behavior changes. The aggregate `checks` job must pass
before integration; follow the repository's branch protection requirements.

For npm publishing, recovery and recurring maintenance tasks, see
[RELEASE.md](RELEASE.md).

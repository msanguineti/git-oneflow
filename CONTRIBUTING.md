# Contributing

The project is in maintenance mode. Contributions focus on bug fixes, security,
runtime support and maintainability; new features are not being added.

## Setup

Follow the [Git, Node.js and npm requirements](README.md#install). If you use nvm,
`.nvmrc` selects the latest Node 22 patch. Run these commands from the repository
root.

```sh
nvm install
nvm use
npm ci
```

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

ESLint checks TypeScript source and skips generated `bin/` and local `.dev/`
files.

Tests create temporary Git repositories and clean them up afterward. The source
tests require a built CLI. The package check builds and installs a tarball in a
temporary directory, then checks its launchers and runs the CLI tests against it.
To check an existing tarball without repacking, run:

```sh
npm run test:package -- /path/to/package.tgz
```

Pull requests run these checks on Linux with Node 22, 24 and 26 and on macOS and
Windows with Node 26. The package workflow also tests one shared tarball across
that matrix.

## Pull requests

Create a short-lived branch from `main`, keep changes focused, and open a pull
request back to `main`. Use Conventional Commit headers such as `type: description`,
optionally `type(scope): description` or `type!: description`. The commit hook
checks this format without enforcing a fixed type list, subject case or length.
Git-generated merge/revert messages and temporary autosquash commits are accepted.
Husky installs the hooks; lint-staged lints TypeScript and formats staged files.
Include relevant regression coverage and update the user guide when behavior
changes. The aggregate `checks` and `package-checks` jobs must pass before
integration. Follow the repository's branch protection requirements.

For npm publishing, recovery and recurring maintenance tasks, see
[RELEASE.md](RELEASE.md).

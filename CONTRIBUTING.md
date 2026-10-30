# Contributing

Use a maintained Node.js LTS release (currently 22, 24 or 26; minimum 22.8.0); `.nvmrc` selects
Node 26. Install locked dependencies with `npm ci`. The package also supports newer
non-EOL stable Node releases. Recheck the [Node release schedule](https://nodejs.org/en/about/previous-releases)
when maintaining or releasing the project.

Run the checks from the repository root:

```sh
npm run typecheck
npm run build
npm run lint
npm run format
npm test
npm run test:package
```

The test suite requires Git and a built CLI. It creates temporary repositories and
cleans them up after each test. The package check builds and installs a tarball in a temporary directory and runs the
CLI tests against it. To check an existing tarball without repacking, use
`npm run test:package -- /path/to/package.tgz`. Pull requests and pushes to `main` run these checks on Linux
across supported LTS lines and on macOS and Windows with the latest LTS. See [ENGINEERING.md](ENGINEERING.md) for
the repository workflow.

For release preparation, recovery and the recurring maintenance checks, see
[RELEASE.md](RELEASE.md). The project is in maintenance mode; new features are out
of scope.

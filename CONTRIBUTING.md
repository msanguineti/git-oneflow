# Contributing

Use a maintained Node.js LTS release (currently 22, 24 or 26); `.nvmrc` selects
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
```

The test suite requires Git and a built CLI. It creates temporary repositories and
cleans them up after each test. Pull requests and pushes to `main` run the checks
on Linux across the supported LTS lines. See [ENGINEERING.md](ENGINEERING.md) for
the repository workflow.

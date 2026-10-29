# Contributing

Git-OneFlow uses Node.js and npm. For an existing checkout, install the locked
dependencies with `npm ci`. The repository's `.nvmrc` selects Node 18, which is
end of life. The package currently declares Node 18 or later and npm 10
or later. The maintenance policy is to support maintained Node LTS versions and
newer non-EOL stable releases; the current tooling has not yet been aligned with it.

Run checks appropriate to your change:

```sh
npm run typecheck
npm run build
npx --no-install eslint . --ext .ts
npx --no-install prettier --check .
```

The `lint` and `format` npm scripts modify files. The test suite can stash local
changes and create or remove `.git-oneflowrc`; run it in a disposable clone, even
when using dry-run mode. From a clean checkout, for example:

```sh
git clone --no-local . /tmp/git-oneflow-tests
cd /tmp/git-oneflow-tests
npm ci
GOF_DRY_RUN=true npm test
```

Choose an unused destination for the clone. A clone of the checkout includes
committed changes, not uncommitted work. For uncommitted changes, use an isolated
copy that includes them. Dry-run checks command output; it does not verify the
actual Git operations. Pull requests against `main` run the existing CI build and
dry-run suite. See [ENGINEERING.md](ENGINEERING.md) for the repository workflow.

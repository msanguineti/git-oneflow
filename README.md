# ![git-OneFlow](https://raw.githubusercontent.com/msanguineti/git-oneflow/main/g1-logo.png)

[![npm](https://badgen.net/npm/v/git-oneflow)](https://www.npmjs.com/package/git-oneflow)
[![License: MIT](https://badgen.net/badge/license/MIT/blue)](https://github.com/msanguineti/git-oneflow/blob/main/LICENSE)

Start and finish feature, release and hotfix branches with `gof` or
`git-oneflow`. The CLI implements
[Adam Ruka’s OneFlow Git workflow](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow)
with either a single main branch or separate main and development branches.

git-OneFlow is in maintenance mode. For a native CLI with additional workflow
models, see [Twigsmith](#twigsmith).

## Install

Install Git and use the latest patch of a
[maintained Node.js LTS line](https://nodejs.org/en/about/previous-releases) or a
newer stable release that is still supported. The package requires Node.js
22.23.4 or later in the 22 line, 24.22.2 or later in the 24 line, or 26.13.0 and
above, and npm 10 or newer.

```sh
npm install -g git-oneflow
gof --help
```

Both `gof` and `git-oneflow` run the same command. To view help without a global
installation, use `npx git-oneflow --help`. Use `npm install -g git-oneflow@next`
to install the version on the pre-release channel.

## Try a feature branch

In a trusted Git repository with a local `main` branch and the default
configuration, preview the branch creation, then run it.

```sh
gof start feature my-feature --dry-run
gof start feature my-feature
```

The second command checks out `feature/my-feature`. After committing your
feature changes, integrate them into `main` locally. This rebases the feature
branch, so review Git's
[guidance for shared branches](https://git-scm.com/book/en/v2/Git-Branching-Rebasing#_rebase_peril)
if others use its commits.

```sh
gof finish feature my-feature --no-interactive --no-push --no-delete
```

The command leaves you on `main` and keeps the feature branch. With the default
options, finishing instead uses interactive rebase, pushes to `origin`, deletes
the local feature branch and prompts to delete its remote counterpart.

See the [usage guide](https://github.com/msanguineti/git-oneflow/blob/main/USAGE.md)
for release and hotfix workflows, configuration, command options and recovery.
Git workflows are tested on Linux, macOS and Windows. The project has yet to
establish a minimum Git version.

## Twigsmith

[Twigsmith 1.0](https://github.com/msanguineti/twigsmith/releases/tag/v1.0.0)
is the Rust successor to git-OneFlow. Consider it for native executables or
configurable OneFlow, GitHub Flow, GitFlow and lightweight trunk workflows,
including supported direct integration and hosted review routes.

Twigsmith has a different interface and configuration model:

- **Installation:** install the separate npm package with
  `npm install -g twigsmith@1.0.0`, or download a native archive.
  Native downloads need neither Node.js nor Rust. Check Twigsmith's
  [platform and npm installer requirements](https://github.com/msanguineti/twigsmith/blob/v1.0.0/docs/USAGE.md#native-archives-and-npm-installation),
  including Git 2.45+.
- **Configuration:** use `tgi config` to choose and edit workflow settings;
  `.git-oneflowrc` is not imported. Bundles generate ordinary
  `twigsmith.config.toml`, YAML or JSON settings.
- **Commands:** invoke `twigsmith` or `tgi`; it installs no `git-oneflow` or
  `gof` aliases. Use `tgi start feature/my-feature` and `tgi finish` for
  the current branch. Release/hotfix policy is explicit, not inferred from a prefix.
- **Migration:** update scripts and aliases for the new commands and options.
  Existing `git-oneflow`/`gof` shell-completion registrations are preserved;
  remove them manually only when no longer needed.

Read the [migration guide](https://github.com/msanguineti/twigsmith/blob/main/docs/USAGE.md#moving-from-the-nodejs-git-oneflow-package)
before switching.

## Project links

- [Release notes](https://github.com/msanguineti/git-oneflow/releases)
- [Contributing](https://github.com/msanguineti/git-oneflow/blob/main/CONTRIBUTING.md)
- [Maintainer release guide](https://github.com/msanguineti/git-oneflow/blob/main/RELEASE.md)

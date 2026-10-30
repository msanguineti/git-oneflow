# ![git-OneFlow](g1-logo.png)

[![CodeFactor](https://www.codefactor.io/repository/github/msanguineti/git-oneflow/badge/main)](https://www.codefactor.io/repository/github/msanguineti/git-oneflow/overview/main)
[![npm](https://badgen.net/npm/v/git-oneflow)](https://www.npmjs.com/package/git-oneflow)
[![code style: prettier](https://badgen.net/badge/code%20style/prettier/ff69b4)](https://prettier.io/) [![Conventional Commits](https://badgen.net/badge/Conventional%20Commits/1.0.0/d4ac20)](https://conventionalcommits.org)
![Dependabot Status](https://badgen.net/github/dependabot/msanguineti/git-oneflow?icon=dependabot)
![CodeQL](https://github.com/msanguineti/git-oneflow/workflows/CodeQL/badge.svg)

> CLI tools implementing the _OneFlow_ git branching model.

OneFlow is a git branching model proposed by [Adam Ruka](https://github.com/skinny85) as an [alternative to GitFlow](https://www.endoflineblog.com/gitflow-considered-harmful).

In [this article](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow#develop-feature-branches), Adam describes how it works and when it should be employed.

git-OneFlow supports both a single main branch and separate main/development
branches. By default, it uses `main` and integrates feature branches by rebasing.
See [Configuration](#configuration) to choose branch names and integration options.

The workflow uses Git rebase and can rewrite branch history. Read Git's
[rebasing guidance](https://git-scm.com/book/en/v2/Git-Branching-Rebasing#_rebase_peril)
before using it on shared branches.

The project is in maintenance mode, with updates focused on fixes and supported
runtimes.

## Node Compatibility

Use the latest patch of a maintained Node.js LTS release or a newer non-EOL stable
release. Current minimum patches are 22.23.4, 24.22.2 and 26.13.0.

Terminal colors use Node.js color detection; its standard `NO_COLOR` and
`FORCE_COLOR` environment variables apply.

## Install

```sh
npm install -g git-oneflow
```

To install a pre-release after it is published:

```sh
npm install -g git-oneflow@next
```

## Usage

```sh
git-oneflow --help
```

or

```sh
gof --help
```

`gof` is a convenient alias for the overly verbose and long to type `git-oneflow`.

### Node Package Execute - npx

It is possible to run `git-oneflow` directly (i.e. no local installation) from the `npm` registry with Node Package Execute:

```sh
npx git-oneflow --help
```

## Configuration

**_git-OneFlow_** provides defaults for a single-main workflow. Some operations
require explicit options for the separate main/development variant described by
Adam Ruka.

### Defaults

#### One main branch

`main`

#### Feature branches

Feature branches stem from `feature`:

```sh
gof start feature my-feature
# equivalent to...
git checkout -b feature/my-feature refs/heads/main
```

Finishing a feature is done by rebasing:

```sh
gof finish feature my-feature
# equivalent to...
git checkout feature/my-feature
git rebase -i main
git checkout main
git merge --ff-only feature/my-feature
git push origin main
git branch -d feature/my-feature
```

#### Release/Hotfix branches

Releases and hotfixes both use `start` and `finish`. Finishing a hotfix also
requires an explicit `--onto` target, as described below.

```sh
gof start release 2.3.0
# equivalent to...
git checkout -b release/2.3.0 refs/heads/main
```

When using a separate development branch, the default still starts a release
from `main`. To include development work, select the development branch or a
specific development commit with `--ref`, for example:

```sh
gof start release 2.3.0 --ref develop
```

A hotfix starts from the nearest annotated tag reachable from the current HEAD,
as selected by `git describe --abbrev=0`, or from `main` if none is reachable.
Lightweight and unreachable tags are not considered. Use `--ref` to select a
different starting point explicitly.

`finish hotfix` requires `--onto <local-branch>`. When a release branch is open,
target that branch so its eventual release tag includes the fix. Otherwise, target
your main or development branch. A missing or invalid target stops the command
before checkout, tagging, merging or pushing.

For a hotfix during an open release:

```sh
gof finish hotfix 2.3.1 --onto release/2.4.0 --tag 2.3.1
gof finish release 2.4.0 --tag 2.4.0
```

Replace the branch and tag names with your own. With separate main and
development branches, confirm the prompts to advance `main` to each tagged
commit. Inspect the tags and branch history before publishing the release.

...then

```sh
gof finish release 2.3.0 -t 2.3.0
# equivalent to...
git checkout release/2.3.0
git tag -a -m '2.3.0' 2.3.0
git checkout main
git merge release/2.3.0
git push --follow-tags origin main
git branch -d release/2.3.0
```

After deleting a local branch, the tool also asks whether to delete its remote
counterpart; the confirmation defaults to yes. This prompt occurs even when
`--no-push` is supplied. Use `--no-delete` to retain the local branch and avoid
the remote deletion prompt.

##### Tags

Tags creation when releasing or hot-fixing might not be needed. One case would be if something like [`standard-version`](https://www.npmjs.com/package/standard-version) is used, which tags releases based on some commit conventions. Therefore, a `--no-tag` option is used to avoid tagging the commit. A commit is either tagged on the command line by passing `-t|--tag <tagName>` or the program will ask to specify a tag name. If both `--tag` (or `-t`) and `--no-tag` are supplied, the last occurrence wins. The same ordering applies to other positive/negative option pairs, such as `--push` and `--no-push`. Use only the form you intend.

### Configuration file

```sh
gof init
```

`init` starts an interactive session that allows for customising the configuration of **_git-OneFlow_**

This creates a `.git-oneflowrc` file with the chosen configuration [options](#configuration-options). **_git-OneFlow_** uses [`cosmiconfig`](https://www.npmjs.com/package/cosmiconfig) under the hood.

Use the tool only with trusted configuration and repositories. Discovered or
explicit JavaScript configuration can execute code before its values are validated.
Git can also execute hooks, editors and transports configured by the repository
or environment; the tool inherits the user's PATH and Git configuration.

To specify a configuration file on the command line use `-c|--config` with the name of the file (and it's path).

```sh
gof start feature -c config/my-gof-config.json
```

An explicit `--config` file replaces the discovered configuration; omitted keys use
the defaults. Command-line options take precedence over the selected file. Boolean
settings must be JSON booleans, and branch prefixes may be empty strings. Invalid
keys, types, strategies, or explicit files cause the command to fail.

#### Configuration options

| Option               | Description                                                              | Default     | Details                                                                                                                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`               | name of the main (production) branch                                     | `main`      | must be set to an existing branch name                                                                                                                                                                                                                                                                                                 |
| `development`        | name of the development branch                                           | `undefined` | not set or an existing branch name                                                                                                                                                                                                                                                                                                     |
| `features`           | name of the features branch (prefixed to the feature name)               | `feature`   | empty string or a valid branch name. This strings works as a branch prefix, e.g. if the chosen feature name is `my-super-feature` the resulting (using the default) branch name for this feature will be `feature/my-super-feature`. An empty string will result in `my-super-feature`. This applies to releases and hotfixes as well. |
| `releases`           | name of the releases branch (prefixed to the release name)               | `release`   | empty string or a valid branch name                                                                                                                                                                                                                                                                                                    |
| `hotfixes`           | name of the hotfixes branch (prefixed to the hotfix name)                | `hotfix`    | empty string or a valid branch name                                                                                                                                                                                                                                                                                                    |
| `strategy`           | which feature integration merge strategy to use                          | `rebase`    | Valid options are: `rebase`, `rebase-no-ff` and `no-ff`                                                                                                                                                                                                                                                                                |
| `interactive`        | whether to rebase interactively `rebase -i`                              | `true`      | the values `true` or `false`, not the strings 'true' or 'false'. See [example](#generate-default-file). Command-line options override this setting, including `--interactive` and `--no-interactive`.                                                                                                                                  |
| `pushAfterMerge`     | whether to push to `origin` after finishing                              | `true`      | `true`, `false`                                                                                                                                                                                                                                                                                                                        |
| `deleteAfterMerge`   | whether to delete the working branch after merging with main/development | `true`      | `true`, `false`                                                                                                                                                                                                                                                                                                                        |
| `tagCommit`          | whether to ask to tag releases and hotfixes                              | `true`      | `true`, `false`. This option is used to decide whether to prompt the user or not in case a tag hasn't been specified, for example with `--tag 2.3.4`.                                                                                                                                                                                  |
| `askOnFeatureStart`  | whether to ask which branch to start a feature from                      | `false`     | `true`, `false`. This option is used to decide whether to prompt the user or not in case they start a feature.                                                                                                                                                                                                                         |
| `askOnFeatureFinish` | whether to ask which branch to merge a feature onto                      | `false`     | `true`, `false`. This option is used to decide whether to prompt the user or not in case they finish a feature.                                                                                                                                                                                                                        |

#### Generate default file

To create a configuration file with default values:

```sh
gof init -y
```

this will create `.git-oneflowrc` in the current directory with the following content:

```json
{
  "main": "main",
  "features": "feature",
  "releases": "release",
  "hotfixes": "hotfix",
  "strategy": "rebase",
  "interactive": true,
  "deleteAfterMerge": true,
  "pushAfterMerge": true,
  "tagCommit": true,
  "askOnFeatureStart": false,
  "askOnFeatureFinish": false
}
```

## Commands

Under the hood, **_git-OneFlow_** uses [`commander`](https://www.npmjs.com/package/commander). Essentially, it is possible to `start` or `finish` either a `feature`, a `release` or an `hotfix`.

Each command can be passed options that modify the default behaviour.

### Common options to start and finish subcommands

| Option flag           | Description                           |
| --------------------- | ------------------------------------- |
| -c, --config \<file\> | configuration file to use             |
| -b, --base \<name\>   | override the current base branch name |
| --no-base             | do not use a base branch name         |

These options apply to the feature, release and hotfix subcommands of `start`
and `finish`; they do not apply to `init` or the parent commands.

### The `start` command

```sh
gof start <feature|release|hotfix> [options] [name]
```

Commands can be shortened using the initial letter:

```sh
gof s f -h # => gof start feature --help
```

#### `start` options

Options are common to every sub-command (`start feature`, `start release`, `start hotfix`)

| Option flag       | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| -r, --ref \<ref\> | new branch will be created from the given branch, commit or tag |
| --no-ref          | create the new branch from the current branch                   |

### The `finish` command

The `finish` command syntax is exactly the same as the `start` command. What changes are the options that can be passed to the sub-commands.

#### Common `finish` options

| Option flag        | Description                                          |
| ------------------ | ---------------------------------------------------- |
| -o,--onto \<onto\> | branch to merge or rebase onto (required for hotfix) |
| -p,--push          | push to origin after merge                           |
| --no-push          | do not push                                          |
| -d,--delete        | delete branch after merge                            |
| --no-delete        | do not delete branch                                 |

#### `finish feature` options

| Option flag                | Description                 |
| -------------------------- | --------------------------- |
| -i,--interactive           | interactive rebase          |
| --no-interactive           | do not rebase interactively |
| -s,--strategy \<strategy\> | merge strategy              |

#### `finish release` and `finish hotfix` options

| Option flag          | Description                                           |
| -------------------- | ----------------------------------------------------- |
| -t,--tag \<tagName\> | tag the commit with the given tag                     |
| --no-tag             | do not tag the commit                                 |
| -m,--message \<msg\> | annotate tag with a message (default to the tag name) |

### `--help` and `--dry-run` options

A help menu is available with every command. Just append `-h` or `--help` to access help.

```sh
gof finish release --help
```

Git failures stop the workflow and return a nonzero exit status. Earlier successful
steps are not rolled back. If a rebase conflicts, resolve the files and run
`git rebase --continue`, or use `git rebase --abort` to return to the state before
that rebase. For a merge conflict, resolve and commit it or use `git merge --abort`
while the merge is in progress. Inspect `git status`, branches, tags and any remote updates before continuing. Earlier steps may already have succeeded; do not blindly rerun the command. Finish the remaining Git operations explicitly after resolving or aborting the conflict.

Installed-package Git workflows run in CI on Linux, macOS and Windows. A minimum Git version has not been established; behavior can depend on the installed Git and platform.

Another interesting way to experiment with **_git-OneFlow_** is to use the `--dry-run` option on a start or finish subcommand. This shows intended Git mutations without performing them; read-only Git queries still run. It does not apply to `init`, which writes a configuration file.

It is possible to activate the `dry-run` mode also by setting the environment variable `GOF_DRY_RUN`

```sh
GOF_DRY_RUN=1 gof start release
```

or for Windows

```sh
set GOF_DRY_RUN=1 & gof start release
```

## Changelog

The changelog can be found on the [Releases page](https://github.com/msanguineti/git-oneflow/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks and pull request guidance.

## License

**_git-OneFlow_** is released under the MIT License. See [LICENSE](./LICENSE) for more details.

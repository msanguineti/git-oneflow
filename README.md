# ![git-OneFlow](g1-logo.png)

[![npm](https://badgen.net/npm/v/git-oneflow)](https://www.npmjs.com/package/git-oneflow)
[![License: MIT](https://badgen.net/badge/license/MIT/blue)](LICENSE)

Command-line tools for the OneFlow Git workflow: create and finish feature, release
and hotfix branches with `gof` or `git-oneflow`.

OneFlow is a Git branching model proposed by [Adam Ruka](https://github.com/skinny85) as an [alternative to GitFlow](https://www.endoflineblog.com/gitflow-considered-harmful).

His [OneFlow guide](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow#develop-feature-branches) explains the workflow and its tradeoffs.

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

Both names run the same command.

### Run with npx

To run the package without installing it globally:

```sh
npx git-oneflow --help
```

## Configuration

git-OneFlow provides defaults for a single-main workflow. Some operations
require explicit options for the separate main/development variant described by
Adam Ruka.

### Defaults

#### One main branch

`main`

#### Feature branches

Feature branch names use the `feature/` prefix and start from `main`:

```sh
gof start feature my-feature
# equivalent to...
git checkout -b feature/my-feature refs/heads/main
```

By default, finishing a feature rebases it onto `main`, integrates it, pushes and
deletes the local feature branch:

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

To finish the release started above:

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

After deleting a local branch, the tool also asks whether to delete its remote
counterpart; the confirmation defaults to yes. This prompt occurs even when
`--no-push` is supplied. Use `--no-delete` to retain the local branch and avoid
the remote deletion prompt.

##### Tags

Use `--tag <name>` (or `-t <name>`) to create an annotated tag when finishing a
release or hotfix. Otherwise, the tool asks for a tag name by default. Use
`--no-tag` to skip tagging, for example when another tool manages your release tags.

If both `--tag` and `--no-tag` are supplied, the last occurrence wins. The same
ordering applies to positive/negative option pairs such as `--push` and
`--no-push`. Use only the form you intend.

### Configuration file

```sh
gof init
```

`init` asks for your configuration and writes it to `.git-oneflowrc`. Configuration
files are loaded with [`cosmiconfig`](https://www.npmjs.com/package/cosmiconfig).

Use the tool only with trusted configuration and repositories. Discovered or
explicit JavaScript configuration can execute code before its values are validated.
Git can also execute hooks, editors and transports configured by the repository
or environment; the tool inherits the user's PATH and Git configuration.

Use `--config <file>` (or `-c <file>`) to select a configuration file:

```sh
gof start feature -c config/my-gof-config.json
```

An explicit `--config` file replaces the discovered configuration; omitted keys use
the defaults. Command-line options take precedence over the selected file. Boolean
settings must be JSON booleans, and branch prefixes may be empty strings. Invalid
keys, types, strategies, or explicit files cause the command to fail.

#### Configuration options

| Option               | Description                                                       | Default   |
| -------------------- | ----------------------------------------------------------------- | --------- |
| `main`               | Existing main (production) branch                                 | `main`    |
| `development`        | Existing development branch; omit for a single-main workflow      | Not set   |
| `features`           | Feature branch prefix                                             | `feature` |
| `releases`           | Release branch prefix                                             | `release` |
| `hotfixes`           | Hotfix branch prefix                                              | `hotfix`  |
| `strategy`           | Feature integration strategy: `rebase`, `rebase-no-ff` or `no-ff` | `rebase`  |
| `interactive`        | Use interactive rebase                                            | `true`    |
| `pushAfterMerge`     | Push to `origin` after finishing                                  | `true`    |
| `deleteAfterMerge`   | Delete the working branch after integration                       | `true`    |
| `tagCommit`          | Ask for a release or hotfix tag when none was supplied            | `true`    |
| `askOnFeatureStart`  | Ask which branch to start a feature from                          | `false`   |
| `askOnFeatureFinish` | Ask which branch to integrate a feature into                      | `false`   |

Branch prefixes must produce valid Git branch names. For example, the default
`features` value produces `feature/my-feature`; an empty prefix produces
`my-feature`. Boolean values must be `true` or `false`, without quotes.

#### Generate default file

To create a configuration file with default values:

```sh
gof init -y
```

This writes `.git-oneflowrc` in the current directory:

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

Use `start` or `finish` with `feature`, `release` or `hotfix`. Each subcommand
accepts options to override its defaults.

### Common options to start and finish subcommands

| Option flag           | Description                     |
| --------------------- | ------------------------------- |
| -c, --config \<file\> | configuration file to use       |
| -b, --base \<name\>   | override the branch-name prefix |
| --no-base             | omit the branch-name prefix     |

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

```sh
gof finish <feature|release|hotfix> [options] [name]
```

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

Use `--help` (or `-h`) with any command to see its options.

```sh
gof finish release --help
```

Git failures stop the workflow and return a nonzero exit status. Earlier successful
steps are not rolled back. If a rebase conflicts, resolve the files and run
`git rebase --continue`, or use `git rebase --abort` to return to the state before
that rebase. For a merge conflict, resolve and commit it or use `git merge --abort`
while the merge is in progress. Inspect `git status`, branches, tags and any remote updates before continuing. Earlier steps may already have succeeded; do not blindly rerun the command. Finish the remaining Git operations explicitly after resolving or aborting the conflict.

Installed-package Git workflows run in CI on Linux, macOS and Windows. A minimum Git version has not been established; behavior can depend on the installed Git and platform.

Use `--dry-run` on a start or finish subcommand to show intended Git changes
without making them. Read-only Git queries still run. This option does not apply
to `init`, which writes a configuration file.

You can also enable dry-run mode with the `GOF_DRY_RUN` environment variable:

```sh
GOF_DRY_RUN=1 gof start release 4.0.0
```

In Windows Command Prompt:

```sh
set GOF_DRY_RUN=1 & gof start release 4.0.0
```

## Changelog

The changelog can be found on the [Releases page](https://github.com/msanguineti/git-oneflow/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks and pull request guidance.

## License

git-OneFlow is released under the MIT License. See [LICENSE](./LICENSE) for more details.

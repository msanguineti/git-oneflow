# ![git-OneFlow](g1-logo.png) <!-- omit in toc -->

[![CodeFactor](https://www.codefactor.io/repository/github/msanguineti/git-oneflow/badge/main)](https://www.codefactor.io/repository/github/msanguineti/git-oneflow/overview/master)
[![npm](https://badgen.net/npm/v/git-oneflow)](https://www.npmjs.com/package/git-oneflow)
[![code style: prettier](https://badgen.net/badge/code%20style/prettier/ff69b4)](https://prettier.io/) [![Conventional Commits](https://badgen.net/badge/Conventional%20Commits/1.0.0/d4ac20)](https://conventionalcommits.org)
![Dependabot Status](https://badgen.net/github/dependabot/msanguineti/git-oneflow?icon=dependabot)
![CodeQL](https://github.com/msanguineti/git-oneflow/workflows/CodeQL/badge.svg)

> CLI tools implementing the _OneFlow_ git branching model.

OneFlow is a git branching model proposed by [Adam Ruka](https://github.com/skinny85) as an [alternative to GitFlow](https://www.endoflineblog.com/gitflow-considered-harmful).

In [this article](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow#develop-feature-branches), Adam describes how it works and when it should be employed.

**_This workflow is not for the uninitiated:_**

1. Heavy use of `rebase`
2. By default, work is off of `master`
3. ???
4. No Profit :( and surefire way to mess things up quickly and embarrassingly.

For a good overview of why you should _and_ when you shouldn't use rebase read [this](https://git-scm.com/book/en/v2/Git-Branching-Rebasing#_rebase_peril)

I have simply put together some CLI commands to leverage the OneFlow model.

I have remained strictly faithful to how Adam defines the workflow without adding anything fancy (yet). This means that, by default, **_git-OneFlow_** works with one main branch only (`master`) and new features are rebased. Check the [customisation](#customisation) section.

Of course, one-size-fits-all does not always work, therefore, I have implemented all the feature integration options described in the article and both the _one main branch_ and _main and development branches_ models.

Fun facts:

1. _Two branches_ model + integration option #2 gives... :drumroll: GitFlow :)
2. Adam Ruka doesn't really like the idea of 'tools' like this one

## Table of Contents <!-- omit in toc -->

- [Node Compatibility](#node-compatibility)
- [Install](#install)
- [Usage](#usage)
  - [Node Package Execute - npx](#node-package-execute---npx)
- [Configuration](#configuration)
  - [Defaults](#defaults)
    - [One main branch](#one-main-branch)
    - [Feature branches](#feature-branches)
    - [Release/Hotfix branches](#releasehotfix-branches)
      - [Tags](#tags)
  - [Configuration file](#configuration-file)
    - [Configuration options](#configuration-options)
    - [Generate default file](#generate-default-file)
- [Commands](#commands)
  - [Common options to **all** commands](#common-options-to-all-commands)
  - [The `start` command](#the-start-command)
    - [`start` options](#start-options)
  - [The `finish` command](#the-finish-command)
    - [Common `finish` options](#common-finish-options)
    - [`finish feature` options](#finish-feature-options)
    - [`finish release` and `finish hotfix` options](#finish-release-and-finish-hotfix-options)
  - [`--help` and `--dry-run` options](#--help-and---dry-run-options)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

## Node Compatibility

Tested in node

- **v10.x**
- **v12.x**
- **v14.x**
- **v15.x**

## Install

```sh
npm install -g git-oneflow
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

It is possible to run `git-oneflow` directly from the `npm` registry with Node Package Execute:

```sh
npx git-oneflow --help
```

## Configuration

**_git-OneFlow_** comes with some defaults which faithfully mirror Adam Ruka recommendations.

### Defaults

#### One main branch

`master`

#### Feature branches

Feature branches stem from `feature`:

```sh
gof start feature my-feature
# equivalent to...
git checkout -b feature/my-feature
```

Finishing a feature is done by rebasing:

```sh
gof finish feature my-feature
# equivalent to...
git checkout feature/my-feature
git rebase -i master
git checkout master
git merge --ff-only feature/my-feature
git push origin master
git branch -d feature/my-feature
```

#### Release/Hotfix branches

Releases and hotfixes share the same workflow: (just substitute `hotfix` for `release` in the following examples)

```sh
gof start release 2.3.0
# equivalent to...
git checkout -b release/2.3.0
```

...then

```sh
gof finish release 2.3.0 -t 2.3.0
# equivalent to...
git checkout release/2.3.0
git tag -a -m '2.3.0' 2.3.0
git checkout master
git merge release/2.3.0
git push --follow-tags origin master
git branch -d release/2.3.0
```

##### Tags

Tags creation when releasing or hot-fixing might not be needed. One case would be if something like [`standard-version`](https://www.npmjs.com/package/standard-version) is used, which tags releases based on some commit conventions. Therefore, a `--no-tag` option is used to avoid tagging the commit. A commit is either tagged on the command line by passing `-t|--tag <tagName>` or the program will ask to specify a tag name. If both `-t` and `--no-tag` are specified, `--no-tag` takes the precedence. This is true for any other `off` switch.

### Configuration file

```sh
gof init
```

`init` starts an interactive session that allows for customising the configuration of **_git-OneFlow_**

This creates a `.gitoneflowrc` file with the chosen configuration [options](#options). **_git-OneFlow_** uses [`cosmiconfig`](https://www.npmjs.com/package/cosmiconfig) under the hood.

To specify a configuration file on the command line use `-c|--configuration` with the name of the file (and it's path).

```sh
gof start feature -c config/my-gof-config.json
```

#### Configuration options

| Option             | Description                                                              | Default     | Details                                                                                                                                                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`             | name of the main (production) branch                                     | `master`    | must be set to an existing branch name                                                                                                                                                                                                                                                                                                 |
| `development`      | name of the development branch                                           | `undefined` | not set or an existing branch name                                                                                                                                                                                                                                                                                                     |
| `features`         | name of the features branch (prefixed to the feature name)               | `feature`   | empty string or a valid branch name. This strings works as a branch prefix, e.g. if the chosen feature name is `my-super-feature` the resulting (using the default) branch name for this feature will be `feature/my-super-feature`. An empty string will result in `my-super-feature`. This applies to releases and hotfixes as well. |
| `releases`         | name of the releases branch (prefixed to the release name)               | `release`   | empty string or a valid branch name                                                                                                                                                                                                                                                                                                    |
| `hotfixes`         | name of the hotfixes branch (prefixed to the hotfix name)                | `hotfix`    | empty string or a valid branch name                                                                                                                                                                                                                                                                                                    |
| `strategy`         | which feature integration merge strategy to use                          | `rebase`    | Valid options are: `rebase`, `rebase-no-ff` and `no-ff`                                                                                                                                                                                                                                                                                |
| `interactive`      | whether to rebase interactively `rebase -i`                              | `true`      | the values `true` or `false`, not the strings 'true' or 'false'. See [example](#generate-default-file). If set to `false` this, and other boolean options, act as a permanent `off` switch for the given option. In this case, it is like `--no-interactive` is always specified on the command line.                                  |
| `pushAfterMerge`   | whether to push to `origin` after finishing                              | `true`      | `true`, `false`                                                                                                                                                                                                                                                                                                                        |
| `deleteAfterMerge` | whether to delete the working branch after merging with main/development | `true`      | `true`, `false`                                                                                                                                                                                                                                                                                                                        |
| `tagCommit`        | whether to ask to tag releases and hotfixes                              | `true`      | `true`, `false`. This option is used to decide whether to prompt the user or not in case a tag hasn't been specified, for example with `--tag 2.3.4`.                                                                                                                                                                                  |

#### Generate default file

To create a configuration file with default values:

```sh
gof init -y
```

this will create `.gitonelfowrc` in the current directory with the following content:

```json
{
  "main": "master",
  "features": "feature",
  "releases": "release",
  "hotfixes": "hotfix",
  "strategy": "rebase",
  "interactive": true,
  "deleteAfterMerge": true,
  "pushAfterMerge": true,
  "tagCommit": true
}
```

## Commands

Under the hood, **_git-OneFlow_** uses [`commander`](https://www.npmjs.com/package/commander). Essentially, it is possible to `start` or `finish` either a `feature`, a `release` or an `hotfix`.

Each command can be passed options that modify the default behaviour.

### Common options to **all** commands

| Option flag           | Description                           |
| --------------------- | ------------------------------------- |
| -c, --config \<file\> | configuration file to use             |
| -b, --base \<name\>   | override the current base branch name |
| --no-base             | do not use a base branch name         |

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

| Option flag        | Description                    |
| ------------------ | ------------------------------ |
| -o,--onto \<onto\> | branch to merge or rebase onto |
| -p,--push          | push to origin after merge     |
| --no-push          | do not push                    |
| -d,--delete        | delete branch after merge      |
| --no-delete        | do not delete branch           |

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

Another interesting way to experiment with **_git-OneFlow_** is to use the `--dry-run` option. This will show the commands that would be invoked without actually doing anything.

It is possible to activate the `dry-run` mode also by setting the environment variable `GOF_DRY_RUN`

```sh
GOF_DRY_RUN=1 gof start release
```

or for Windows

```sh
set GOF_DRY_RUN=1 & gof start release
```

## Changelog

See [CHANGELOG](./CHANGELOG.md) for latest changes.

## Contributing

PRs welcome!

## License

**_git-OneFlow_** is released under the MIT License. See [LICENSE](./LICENSE) for more details.

# git-OneFlow <!-- omit in toc -->

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/cf218c6295b74730baeb4395052d8f7f)](https://app.codacy.com/app/msanguineti/git-oneflow?utm_source=github.com&utm_medium=referral&utm_content=msanguineti/git-oneflow&utm_campaign=Badge_Grade_Settings)
![npm](https://img.shields.io/npm/v/git-oneflow.svg) ![Travis (.org)](https://img.shields.io/travis/msanguineti/git-oneflow.svg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![Greenkeeper badge](https://badges.greenkeeper.io/msanguineti/git-oneflow.svg)](https://greenkeeper.io/)

CLI tools implementing the *OneFlow* git branching model.

## Documentation <!-- omit in toc -->

- [Introduction](#Introduction)
- [Description](#Description)
- [Installation](#Installation)
- [Usage](#Usage)
- [Configuration](#Configuration)
  - [Defaults](#Defaults)
    - [One main branch](#One-main-branch)
    - [Feature branches](#Feature-branches)
    - [Release/Hotfix branches](#ReleaseHotfix-branches)
      - [Tags](#Tags)
  - [Customisation](#Customisation)
    - [Options](#Options)
- [Changelog](#Changelog)
- [License & Disclaimer](#License--Disclaimer)
  
## Introduction

OneFlow is a git branching model proposed by [Adam Ruka](https://github.com/skinny85) as an [alternative to GitFlow](https://www.endoflineblog.com/gitflow-considered-harmful).

In [this article](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow#develop-feature-branches), Adam describes how it works and when it should be employed.

***This workflow is not for the uninitiated:***

1. Heavy use of `rebase`
2. By default, work is off of `master`
3. ???
4. No Profit :( and surefire way to mess things up quickly and embarrassingly.

For a good overview of why you should _and_ when you shouldn't use rebase read [this](https://git-scm.com/book/en/v2/Git-Branching-Rebasing#_rebase_peril)

## Description

I have simply put together some CLI commands to leverage the OneFlow model.

I have remained strictly faithful to how Adam defines the worlflow without adding anything fancy (yet). This means that, by default, ***git-OneFlow*** works with one main branch only (`master`) and new features are rebased. Check the [initialisation](#initialisation) section.

Of course, one-size-fits-all does not always work, therefore, I have implemented all the feature integration options described in the article and both the _one main branch_ and _main and development branches_ models.

Fun facts:

1. _Two branches_ model + integration option #2 gives... :drumroll: GitFlow :)
2. Adam Ruka doesn't really like the idea of 'tools' like this one

## Installation

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

## Configuration

***git-OneFlow*** comes with some defaults which faithfully mirror Adam Ruka recommendations.

### Defaults

#### One main branch

`master`

#### Feature branches

Feature branches stem from `feature`:

```sh
$ gof feature start my-feature
# equivalent to...
$ git checkout -b feature/my-feature
```

Finishing a feature is done by rebasing:

```sh
$ gof feature finish my-feature
# equivalent to...
$ git checkout feature/my-feature
$ git rebase -i master
$ git checkout master
$ git merge --ff-only feature/my-feature
$ git push origin master
$ git branch -d feature/my-feature
```

#### Release/Hotfix branches

Releases and hotfixes share the same workflow: (just substitute `hotfix` for `release` in the following examples)

```sh
$ gof release start 2.3.0
# equivalent to...
$ git checkout -b release/2.3.0
```

...then

```sh
$ gof release finish 2.3.0
# equivalent to...
$ git checkout release/2.3.0
$ git tag 2.3.0
$ git checkout master
$ git merge release/2.3.0
$ git push --tags origin master
$ git branch -d release/2.3.0
```

Using the above commands, release (and hotfix) branches will stem from the current branch. Hopefully this is `master`, but even so, this might not be desirable. Therefore, the `start` command takes an extra optional parameter which defines where the release (or hotfix) should stem from.

```sh
$ gof release start 2.3.0 09f76a3
# equivalent to...
$ git checkout -b release/2.3.0 09f76a3
```

The above command will start a release from commit `09f76a3`.

##### Tags

Automatic tagging creation when releasing or hotfixing might not be needed. One case would be if something like `standard version` is used, which tags releases based on some commit conventions. Therefore, there's a configuration option named `tags` which is `true` by default. Setting it to `false` will not create tags and also tags won't be pushed.

```sh
# do work, commit, test, build, ...
$ npm run release
# standard version does its magic
# some tag is created
$ gof release finish my-release
# equivalent to...
$ git checkout master
$ git merge release/my-release
$ git push origin master
$ git branch -d release/my-release
# now push --follow-tags origin && npm publish
```

_It is up to the user to manage tagging._

### Customisation

```sh
$ gof init
...
```

`init` starts an interactive session that allows for customising the configuration of ***git-OneFlow***

This creates a `gof.config.js` file with the chosen configuration options.

By default, ***git-OneFlow*** checks for a config file [`gof.config.js`, `.gofrc.json` or `.gofrc.js`], or a dedicated `git-oneflow` section in `package.json`

```js
// package.json
{
  "git-oneflow": {
    // options
  }
}
```

#### Options

`main`: name of the main (production) branch (default `master`)

`usedev`: whether to use a development branch (default `false`)

`development`: the name of the development branch (default: `develop`)

`feature`: name of the features branch (default `feature`)

`release`: name of the releases branch (default `release`)

`hotfix`: name of the hotfixes branch (default `hotfix`)

`integration`: which feature integration strategy to use (default #`1`)

`interactive`: whether to rebase interactively `rebase -i` (default `always`, can also be `never` or `ask`)

`push`: whether to push to `origin` after finishing (default `always`, can also be `never` or `ask`)

`delete`: whether to delete the current working branch after merging with main/development (default `always`, can also be `never` or `ask`)

`tags`: whether to automatically tag releases and hotfixes (default: `true`)

When an option is set to `ask`, the user will be prompted to choose an action when appropriate.

## Changelog

See [CHANGELOG](./CHANGELOG.md) for latest changes.

## License & Disclaimer

***git-OneFlow*** is released under the MIT License. See [LICENSE](./LICENSE) for more details.

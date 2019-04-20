# git-OneFlow

![npm](https://img.shields.io/npm/v/git-oneflow.svg) ![Travis (.org)](https://img.shields.io/travis/msanguineti/git-oneflow.svg) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![Greenkeeper badge](https://badges.greenkeeper.io/msanguineti/git-oneflow.svg)](https://greenkeeper.io/)

CLI tools implementing the *OneFlow* git branching model.

## Introduction

OneFlow is a git branching model proposed by [Adam Ruka](https://github.com/skinny85) as an [alternative to GitFlow](https://www.endoflineblog.com/gitflow-considered-harmful).

In [this article](https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow#develop-feature-branches), Adam describes how it works and when it should be employed.

***This workflow is not for the uninitiated:***

1. Heavy use of `rebase`
2. By default, work is off of `master`
3. ???
4. No Profit :( and surefire way to mess things up quickly and embarrassingly.

For a good overview of why you should _and_ when you shouldn't use rebase read [this](https://git-scm.com/book/en/v2/Git-Branching-Rebasing#_rebase_peril)

## Documentation

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
  - [Initialisation](#initialisation)
  - [Examples](#examples)
- [Changelog](#changelog)
- [License](#license)

## Description

I have simply put together some CLI commands to leverage the OneFlow model.

I have remained strictly faithful to how Adam defines the worlflow without adding anything fancy (yet). This means that, by default, *****git-OneFlow***** works with one main branch only (`master`) and new features are rebased. Check the [initialisation](#initialisation) section.

Of course, one-size-fits-all does not always work, therefore, I have implemented all the feature integration options described in the article and both the _one main branch_ and _main and development branches_ models.

Fun facts:

1. _Two branches_ model + integration option #2 gives... :drumroll: GitFlow :)
2. Adam Ruka doesn't really like the idea of 'tools' like this one

## Installation

```sh
npm install --save-dev git-oneflow
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

### Configuration

***git-OneFlow*** comes with some defaults which faithfully mirror Adam Ruka recommendations. These defaults are:

***One main branch***

`master`

***Features***

_Feature branches stem from `feature`:_

```sh
$ gof feature start my-feature
# equivalent to...
$ git checkout -b feature/my-feature
```

_Finishing a feature is done by rebasing:_

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

***Releases / Hotfixes***

_Releases and hotfixes share the same workflow:_ (just substitute `hotfix` for `release` in the following examples)

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

***Customisation***

```sh
$ gof init
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

***Options***

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

### Examples

TODO - add examples

## Changelog

See [CHANGELOG](./CHANGELOG.md) for latest changes.

## License

***git-OneFlow*** is released under the MIT License. See [LICENSE](./LICENSE) for more details.

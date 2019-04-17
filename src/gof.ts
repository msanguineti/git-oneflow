// Copyright (c) 2019 Mirco Sanguineti
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import program from 'yargs'
import sh from 'shelljs'
import chalk from 'chalk'
import init from './init'
import { loadConfigValues } from './core'

if (!sh.which('git')) {
  console.error("Sorry, git-OneFlow requires git... it's in the name")
  process.exit(1)
}

// eslint-disable-next-line
program
  .version()
  .alias('v', 'version')
  .config(loadConfigValues())
  .pkgConf('git-oneflow')
  .command(init)
  .option('x', {
    alias: 'dry-run',
    description: 'Show what the command would do'
  })
  .demandCommand(1, chalk.red.bold('Please, choose a command'))
  .help()
  .alias('h', 'help').argv

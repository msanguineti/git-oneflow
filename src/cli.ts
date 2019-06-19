/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import yargs from 'yargs'
import sh from 'shelljs'
import init from './cmds/init'
import { loadConfigValues } from './core'
import feature from './cmds/feature'
import { basename } from 'path'
import release from './cmds/release'
import hotfix from './cmds/hotfix'

import pkg from '../package.json'

if (!sh.which('git')) {
  console.error("Sorry, git-OneFlow requires git... it's in the name")
  process.exit(1)
}

var argv = yargs
  .scriptName(pkg.name)
  .version()
  .alias('v', 'version')
  .config(loadConfigValues())
  .pkgConf('git-oneflow')
  .command(init)
  .command(feature)
  .command(release)
  .command(hotfix)
  // .option('x', {
  //   alias: 'dry-run',
  //   description: 'Show what the command would do'
  // })
  // .demandCommand(1, chalk.red.bold('Please, choose a command'))
  .help()
  .alias('h', 'help').argv

if (argv['_'].length <= 0) {
  console.log(`Try ${basename(process.argv[1])} --help`)
}

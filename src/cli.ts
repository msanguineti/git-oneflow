/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import yargs from 'yargs'
import { which } from 'shelljs'
import { loadConfigValues } from './core'
import { basename } from 'path'
import { name } from '../package.json'
import Feature from './cmds/feature'
import Init from './cmds/init'
import Release from './cmds/release'
import Hotfix from './cmds/hotfix'
import { warning, error } from './utils/text'

if (!which('git')) {
  console.error(error("Sorry, git-OneFlow requires git... it's in the name"))
  process.exit(1)
}

const argv = yargs
  .scriptName(name)
  .version()
  .alias('v', 'version')
  .config(loadConfigValues())
  .pkgConf('git-oneflow')
  .command(new Init())
  .command(new Feature())
  .command(new Release())
  .command(new Hotfix())
  .help()
  .alias('h', 'help').argv

if (argv['_'].length <= 0) {
  console.log(warning(`Try ${basename(process.argv[1])} --help`))
}

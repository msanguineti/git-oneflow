// Copyright (c) 2019 Mirco Sanguineti
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import program from 'commander'
import shell from 'shelljs'
import { version } from '../package.json'

if (!shell.which('git')) {
  shell.echo("Sorry, git-OneFlow requires git... it's in the name")
  shell.exit(1)
}

program
  .version(version, '-v, --version')
  .description('CLI tools for git-OneFlow')
  .command('init', 'Create a config file')
  .parse(process.argv)

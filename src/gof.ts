// Copyright (c) 2019 Mirco Sanguineti
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import shell from 'shelljs'

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git')
  shell.exit(1)
}

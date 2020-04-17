import resolve from 'rollup-plugin-node-resolve'
import cjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'

const preamble = `#!/usr/bin/env node

/**
 * Copyright (c) ${new Date().getFullYear()} Mirco Sanguineti
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */ 
`
const extensions = ['.js', '.ts']

const input = 'src/index.ts'

const plugins = [
  json(),
  resolve({ extensions }),
  cjs(),
  babel({ extensions, include: ['src/**/*'] }),
  terser({ output: { beautify: true, preamble: preamble } }),
]

const output = {
  file: 'bin/cli',
  format: 'cjs',
  entryFileNames: '[name]',
}

export default {
  input,

  // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en#external-e-external
  external: [
    'shelljs',
    'commander',
    'inquirer',
    'chalk',
    'cosmiconfig',
    'path',
    'child_process',
    'fs',
  ],

  plugins,

  output,
}

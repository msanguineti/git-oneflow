import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'
import { version, dependencies } from './package.json'
import builtins from 'builtin-modules'

const preamble = `#!/usr/bin/env node

/**
 * git-OneFlow v${version}
 * 
 * Copyright (c) ${new Date().getFullYear()} Mirco Sanguineti
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */ 
`

const input = 'src/index.ts'

const plugins = [
  json(),
  resolve(),
  commonjs(),
  typescript(),
  terser({ output: { beautify: true, preamble: preamble } }),
]

const output = {
  file: 'bin/cli',
  format: 'cjs',
  entryFileNames: '[name]',
}

export default {
  input,

  external: [...builtins, ...Object.keys(dependencies)],

  plugins,

  output,
}

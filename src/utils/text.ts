/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import chalk from 'chalk'

export const success = (str: string): string => {
  return chalk.black.bgGreen(str)
}

export const warning = (str: string): string => {
  return chalk.black.bgYellow(str)
}

export const error = (str: string): string => {
  return chalk.black.bgRed(str)
}

export const info = (str: string): string => {
  return chalk.black.bgCyan(str)
}

export const bold = (str: string): string => {
  return chalk.bold(str)
}

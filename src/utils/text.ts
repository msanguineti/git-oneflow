/**
 * Copyright (c) 2019 Mirco Sanguineti
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import chalk from 'chalk'

export const bold = (str: unknown): string => {
  return chalk.bold(str)
}

export const success = (str: unknown): string => {
  return chalk.black.bgGreen(str)
}

export const warning = (str: unknown): string => {
  return chalk.black.bgYellow(str)
}

export const error = (str: unknown): string => {
  return chalk.black.bgRed(str)
}

export const info = (str: unknown): string => {
  return chalk.black.bgCyan(str)
}

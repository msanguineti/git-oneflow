import { readFileSync } from 'node:fs'

const header = readFileSync(process.argv[2], 'utf8').split(/\r?\n/, 1)[0]

// Preserve Git-generated merge/revert messages and temporary autosquash commits.
const generated = /^(?:Merge |Revert "|(?:fixup|squash|amend)! )/.test(header)
const conventional = /^[a-z][a-z0-9-]*(?:\([^()\s]+\))?!?: \S.*$/.test(header)

if (!generated && !conventional) {
  console.error(
    'Use type: description, with an optional scope and ! (e.g. fix(cli): handle missing config).',
  )
  process.exitCode = 1
}

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const expected = process.env.EXPECTED_DIGEST
if (!/^[a-f0-9]{64}$/.test(expected ?? ''))
  throw new Error('Missing candidate digest')
const actual = createHash('sha256')
  .update(readFileSync(process.argv[2]))
  .digest('hex')
if (actual !== expected) throw new Error('Candidate digest mismatch')

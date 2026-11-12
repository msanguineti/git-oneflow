import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const checker = fileURLToPath(
  new URL('../scripts/check-commit-message.js', import.meta.url),
)

test('commit headers enforce format while allowing custom types and Git messages', () => {
  const root = mkdtempSync(join(tmpdir(), 'oneflow commit message -'))
  const file = join(root, 'message with spaces.txt')
  try {
    for (const message of [
      'fix: handle missing config',
      'maintenance(cli)!: simplify settings\r\n\r\nDetails here.\r\n',
      'docs: Explain the new alternative.\n\nA longer body.',
      "Merge branch 'main'",
      'Revert "fix: handle missing config"',
      'fixup! fix: handle missing config',
      'squash! docs: explain setup',
      'amend! fix: handle missing config',
    ]) {
      writeFileSync(file, message)
      const result = spawnSync(process.execPath, [checker, file])
      assert.equal(result.status, 0, `${message}: ${result.stderr}`)
    }
    for (const message of [
      '',
      'update dependencies',
      'fix: ',
      'fix:missing space',
      'Fix: mixed-case type',
      'fix(): empty scope',
      'unformatted title\n\nfix: a valid body does not fix the title',
    ]) {
      writeFileSync(file, message)
      const result = spawnSync(process.execPath, [checker, file])
      assert.equal(result.status, 1, message)
      assert.match(result.stderr.toString(), /Use type: description/)
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

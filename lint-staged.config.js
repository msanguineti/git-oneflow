module.exports = {
  '**/*.ts': () => 'tsc -p tsconfig.json --noEmit',
  '**/*': ['prettier-standard --lint', 'git add']
}

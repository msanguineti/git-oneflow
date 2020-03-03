module.exports = {
  // '**/*.ts': () => 'tsc -p tsconfig.json',
  '**/*.ts': 'eslint --fix',
  '**/*.{ts,js,md,yml,json}': 'prettier --write'
}

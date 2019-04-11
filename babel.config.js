module.exports = function (api) {
  api.cache(true)

  const presets = [
    [
      '@babel/env',
      {
        targets: {
          node: true
        }
      }
    ],
    '@babel/typescript'
  ]

  const plugins = [
    // "@babel/syntax-dynamic-import",
    // ["dynamic-import-node", { noInterop: true }],
    '@babel/proposal-class-properties'
  ]

  return {
    presets,
    plugins
  }
}

module.exports = function (api) {
  api.cache(true);

  const presets = [["@babel/env", {
    "targets": {
      "node": true
    }
  }],
    "@babel/preset-typescript"]
  const plugins = []

  return {
    presets,
    plugins
  };
}

const BABEL_ENV = process.env.BABEL_ENV
const isCommonJS = BABEL_ENV !== undefined && BABEL_ENV === "cjs"
const isESM = BABEL_ENV !== undefined && BABEL_ENV === "esm"

module.exports = function babelConfig(api) {
  api.cache(true)

  const presets = [
    [
      "@babel/env",
      {
        loose: true,
        modules: isCommonJS ? "commonjs" : false,
        targets: {
          node: "current",
          esmodules: isESM ? true : undefined,
        },
      },
    ],
    "@babel/preset-typescript",
  ]

  const plugins = [
    ["@babel/plugin-proposal-private-methods", { loose: false }],
    "@babel/plugin-proposal-class-properties",
  ]

  return {
    presets,
    plugins,
  }
}

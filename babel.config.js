module.exports = {
  presets: [
    [
      "@babel/env",
      {
        bugfixes: true,
        targets: {
          browsers: "Chrome >= 74, Safari >= 13.1, iOS >= 13.3, Firefox >= 78, Edge >= 79",
          node: 12,
        },
      },
    ],
    "@babel/preset-typescript",
  ],
  plugins: [["@babel/plugin-proposal-private-methods", { loose: false }], "@babel/plugin-proposal-class-properties"],
}

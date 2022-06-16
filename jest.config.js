module.exports = {
  transform: {
    "^.+\\.(ts|tsx)?$": "@swc-node/jest",
  },
  testPathIgnorePatterns: ["<rootDir>/e2e/"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"],
  watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
  collectCoverageFrom: ["**/src/**/*.(ts|tsx)"],
  modulePathIgnorePatterns: ["dist"],
}

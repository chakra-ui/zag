module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.(ts|tsx)?$": "@swc-node/jest",
  },
  testPathIgnorePatterns: ["<rootDir>/cypress/"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"],
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
  watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
  collectCoverageFrom: ["**/src/**/*.(ts|tsx)"],
  modulePathIgnorePatterns: ["dist"],
}

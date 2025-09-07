import { defineConfig } from "@playwright/test"
import baseConfig, { getWebServer } from "./playwright.config"

// Set default Lit framework
process.env.FRAMEWORK = process.env.FRAMEWORK || "lit"
const webServer = getWebServer()

export default defineConfig({
  ...baseConfig,

  webServer,
  use: {
    baseURL: webServer.url,
  },

  // Only test implemented Lit components
  testMatch: [
    "**/accordion.e2e.ts",
    "**/checkbox.e2e.ts",
    "**/collapsible.e2e.ts",
    "**/dialog.e2e.ts",
    "**/menu.e2e.ts",
    "**/popover.e2e.ts",
    "**/radio-group.e2e.ts",
    "**/slider.e2e.ts",
    "**/switch.e2e.ts",
    "**/tabs.e2e.ts",
    "**/toggle-group.e2e.ts",
    "**/toggle.e2e.ts",
  ],

  // // Custom projects for Lit testing with different DOM modes
  // projects: [
  //   {
  //     name: "lit-light-dom",
  //     use: {
  //       ...baseConfig.use,
  //     },
  //     // Environment variables are set via process.env before test execution
  //     // VITE_DOM_MODE=light-dom will be set when running this project
  //   },
  //   {
  //     name: "lit-shadow-dom",
  //     use: {
  //       ...baseConfig.use,
  //     },
  //     // Environment variables are set via process.env before test execution
  //     // VITE_DOM_MODE=shadow-dom will be set when running this project
  //   },
  // ],
})

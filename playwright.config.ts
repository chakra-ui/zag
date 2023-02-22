import type { PlaywrightTestConfig, ReporterDescription } from "@playwright/test"

export function getWebServer() {
  const framework = process.env.FRAMEWORK || "react"

  const frameworks = {
    react: {
      cwd: "./examples/next-ts",
      command: "PORT=3000 pnpm dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
    },
    vue: {
      cwd: "./examples/vue-ts",
      command: "pnpm vite --port 3001",
      url: "http://localhost:3001",
      reuseExistingServer: !process.env.CI,
    },
    solid: {
      cwd: "./examples/solid-ts",
      command: "pnpm vite --port 3002",
      url: "http://localhost:3002",
      reuseExistingServer: !process.env.CI,
    },
  }

  return frameworks[framework]
}

const webServer = getWebServer()

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  outputDir: "./e2e/results",
  testMatch: "*.e2e.ts",
  fullyParallel: !process.env.CI,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    process.env.CI ? ["github", ["junit", { outputFile: "e2e/junit.xml" }]] : ["list"],
    ["html", { outputFolder: "e2e/report", open: "never" }],
  ].filter(Boolean) as ReporterDescription[],
  retries: process.env.CI ? 2 : 0,
  webServer,
  use: {
    baseURL: webServer.url,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-US",
    timezoneId: "GMT",
  },
}

export default config

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FRAMEWORK: string
    }
  }
}

import { defineConfig, type PlaywrightTestConfig } from "@playwright/test"

const CI = !!process.env.CI

type InferServer<T> = Exclude<T extends Array<infer U> ? U : T, undefined>

type WebServer = InferServer<PlaywrightTestConfig["webServer"]>

export function getWebServer(): WebServer {
  const framework = process.env.FRAMEWORK || "react"

  const frameworks: Record<string, WebServer> = {
    react: {
      cwd: "./examples/next-ts",
      command: "cross-env PORT=3000 pnpm dev",
      url: "http://localhost:3000",
      reuseExistingServer: !CI,
    },
    vue: {
      cwd: "./examples/vue-ts",
      command: "pnpm vite --port 3001",
      url: "http://localhost:3001",
      reuseExistingServer: !CI,
    },
    solid: {
      cwd: "./examples/solid-ts",
      command: "pnpm vite --port 3002",
      url: "http://localhost:3002",
      reuseExistingServer: !CI,
    },
    svelte: {
      cwd: "./examples/svelte-ts",
      command: "pnpm vite --port 3003",
      url: "http://localhost:3003",
      reuseExistingServer: !CI,
    },
    alpine: {
      cwd: "./examples/alpine-ts",
      command: "pnpm vite --port 3005",
      url: "http://localhost:3005",
      reuseExistingServer: !CI,
    },
  }

  return frameworks[framework]
}

const webServer = getWebServer()

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/results",
  testMatch: "*.e2e.ts",
  fullyParallel: !CI,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!CI,
  reportSlowTests: null,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : "50%",
  reporter: [
    process.env.CI ? ["github", ["junit", { outputFile: "e2e/junit.xml" }]] : ["list"],
    ["html", { outputFolder: "e2e/report", open: "never" }],
  ],
  webServer,
  use: {
    baseURL: webServer.url,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-US",
    timezoneId: "GMT",
  },
})

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FRAMEWORK: string
    }
  }
}

import { defineConfig, type PlaywrightTestConfig } from "@playwright/test"

const CI = !!process.env.CI

type InferServer<T> = Exclude<T extends Array<infer U> ? U : T, undefined>

type WebServer = InferServer<PlaywrightTestConfig["webServer"]>

const examples = {
  react: { dir: "next-ts", port: "3000" },
  vue: { dir: "nuxt-ts", port: "3001" },
  solid: { dir: "solid-ts", port: "3002" },
  svelte: { dir: "svelte-ts", port: "3003" },
  preact: { dir: "preact-ts", port: "3004" },
}

export function getWebServer(): WebServer {
  const framework = process.env.FRAMEWORK || "react"

  const example = examples[framework as keyof typeof examples]
  if (!example) {
    throw new Error(`Unknown FRAMEWORK "${framework}". Expected one of: ${Object.keys(examples).join(", ")}`)
  }

  const port = process.env.PORT ?? example.port

  return {
    cwd: `./examples/${example.dir}`,
    command: "pnpm dev",
    env: { PORT: port },
    url: `http://localhost:${port}`,
    reuseExistingServer: !CI,
  }
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
    timezoneId: "UTC",
  },
})

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FRAMEWORK: string
    }
  }
}

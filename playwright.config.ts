import { PlaywrightTestConfig, ReporterDescription } from "@playwright/test"

function getBaseUrl() {
  const port = process.env.PORT || "3000"
  return `http://localhost:${port}`
}

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  outputDir: "./e2e/results",
  testMatch: "*.e2e.ts",
  timeout: 30_000,
  fullyParallel: true,
  expect: {
    timeout: 5_000,
  },
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    process.env.CI ? ["list"] : ["line"],
    process.env.CI ? ["junit", { outputFile: "e2e/junit.xml" }] : null,
    ["html", { outputFolder: "e2e/report", open: "never" }],
  ].filter(Boolean) as ReporterDescription[],
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: "retain-on-failure",
    baseURL: getBaseUrl(),
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-US",
    timezoneId: "GMT",
  },
}
export default config

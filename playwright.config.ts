import { PlaywrightTestConfig, ReporterDescription } from "@playwright/test"

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  testMatch: ["**/*.e2e.ts"],
  timeout: 30_000,
  fullyParallel: true,
  expect: {
    timeout: 5_000,
  },
  forbidOnly: !!process.env.CI,
  reporter: [
    process.env.CI ? ["list"] : ["line"],
    process.env.CI ? ["junit", { outputFile: "e2e/junit.xml" }] : null,
    ["html", { outputFolder: "e2e/report", open: "never" }],
  ].filter(Boolean) as ReporterDescription[],
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: "retain-on-failure",
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-US",
    timezoneId: "GMT",
  },
}
export default config

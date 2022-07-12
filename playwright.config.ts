import { PlaywrightTestConfig } from "@playwright/test"

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  testMatch: ["**/*.e2e.ts"],
  timeout: 30_000,
  fullyParallel: true,
  expect: {
    timeout: 5_000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: "on-first-retry",
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    video: "retain-on-failure",
    locale: "en-US",
  },
}
export default config

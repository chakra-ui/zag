import { PlaywrightTestConfig } from "@playwright/test"

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  testMatch: ["**/*.e2e.ts"],
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: "on-first-retry",
    baseURL: "http://localhost:3000",
    video: "retain-on-failure",
  },
}
export default config

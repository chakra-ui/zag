import { test } from "@playwright/test"
import { a11y } from "./__utils"

test.describe("avatar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/avatar")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page, ".avatar")
  })
})

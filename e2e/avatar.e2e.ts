import { test } from "@playwright/test"
import { a11y } from "./_utils"

test.describe("avatar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/avatar/basic")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page, ".avatar")
  })
})

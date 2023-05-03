import { test } from "@playwright/test"
import { a11y } from "./__utils"

test.describe("color-picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/color-picker")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page, ".color-picker")
  })
})

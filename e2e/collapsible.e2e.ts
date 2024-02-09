import { expect, test } from "@playwright/test"
import { a11y, part } from "./_utils"

const trigger = part("trigger")
const content = part("content")

test.describe("collapsible", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/collapsible")
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test("[toggle] should be open when clicked", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(content)).toBeVisible()

    await page.click(trigger)
    await expect(page.locator(content)).not.toBeVisible()
  })

  test.skip("[closed] content should not be reachable via tab key", async ({ page }) => {
    await page.click(trigger)
    await page.click(trigger)
    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: "Open" })).toBeFocused()
  })
})

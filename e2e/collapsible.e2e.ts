import { expect, test } from "./_test"
import { a11y, clickControls, controls, part } from "./_utils"

const trigger = part("trigger")
const content = part("content")

test.describe("collapsible", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/collapsible/basic")
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

  test("[disabled] trigger should be disabled and skipped by tab", async ({ page }) => {
    await clickControls(page)
    await controls(page).bool("disabled")
    await expect(page.locator(trigger)).toBeDisabled()

    await page.getByRole("button", { name: "Open", exact: true }).focus()
    await page.keyboard.press("Shift+Tab")
    await expect(page.locator(trigger)).not.toBeFocused()
  })

  test.skip("[closed] content should not be reachable via tab key", async ({ page }) => {
    await page.click(trigger)
    await page.click(trigger)
    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: "Open", exact: true })).toBeFocused()
  })
})

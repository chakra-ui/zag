import { expect, test } from "@playwright/test"
import { controls, testid } from "./__utils"

const trigger = testid("trigger")
const menu = testid("menu")

test.describe("menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu")
  })

  test("should note close menu when `closeOnSelect` is false [keyboard]", async ({ page }) => {
    await controls(page).bool("closeOnSelect", false)
    await page.click(trigger)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter", { delay: 10 })
    await expect(page.locator(menu)).toBeVisible()
  })
})

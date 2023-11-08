import { expect, test, type Page } from "@playwright/test"
import { part, repeat } from "./_utils"

const trigger = part("context-trigger")
const menu = part("content")

const expectToBeFocused = async (page: Page, id: string) => {
  return expect(page.locator(`[id=${id}]`).first()).toHaveAttribute("data-highlighted", "")
}

test.describe("context menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/context-menu")
  })

  test("should open on right click", async ({ page }) => {
    await page.click(trigger, { button: "right" })

    await expect(page.locator(menu)).toBeVisible()
    await expect(page.locator(menu)).toBeFocused()

    await page.press("body", "Escape")
    await expect(page.locator(menu)).not.toBeVisible()
  })

  test("keyboard navigation works", async ({ page }) => {
    await page.click(trigger, { button: "right" })
    await repeat(3, () => page.keyboard.press("ArrowDown"))
    await expectToBeFocused(page, "delete")
  })
})

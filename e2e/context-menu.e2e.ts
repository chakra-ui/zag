import { expect, test, type Page } from "@playwright/test"
import { part, repeat } from "./_utils"

const contextTrigger = part("context-trigger")
const content = part("content")

const expectToBeFocused = async (page: Page, id: string) => {
  return expect(page.locator(`[id=${id}]`).first()).toHaveAttribute("data-highlighted", "")
}

test.describe("context menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/context-menu")
  })

  test("should open on right click", async ({ page }) => {
    await page.click(contextTrigger, { button: "right" })

    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toBeFocused()

    await page.press("body", "Escape")
    await expect(page.locator(content)).not.toBeVisible()
  })

  test("keyboard navigation works", async ({ page }) => {
    await page.click(contextTrigger, { button: "right" })

    await repeat(3, () => page.keyboard.press("ArrowDown"))
    await expectToBeFocused(page, "delete")
  })
})

import { expect, test } from "@playwright/test"
import { rect } from "./_utils"

const contextTrigger = (id: number) => `[data-scope="menu"][data-part="context-trigger"][data-value="${id}"]`
const menu = '[data-scope="menu"][data-part="content"]'
const positioner = '[data-scope="menu"][data-part="positioner"]'

test.describe("context menu / multiple triggers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/context-menu-multiple-trigger")
  })

  test("should open menu on right-click", async ({ page }) => {
    await page.click(contextTrigger(1), { button: "right" })
    await expect(page.locator(menu)).toBeVisible()
    await expect(page.locator(menu)).toBeFocused()
  })

  test("should switch triggers and reposition on right-click", async ({ page }) => {
    // Right-click first trigger
    await page.click(contextTrigger(1), { button: "right" })
    await expect(page.locator(menu)).toBeVisible()

    // Get menu position after first trigger
    const menuRect1 = await rect(page.locator(positioner))

    // Right-click second trigger - menu should stay open and reposition
    await page.click(contextTrigger(2), { button: "right" })
    await expect(page.locator(menu)).toBeVisible()
    await expect(page.locator(menu)).toBeFocused()

    // Get menu position after switching
    const menuRect2 = await rect(page.locator(positioner))

    // Menu should have repositioned (different position)
    expect(menuRect2.x !== menuRect1.x || menuRect2.y !== menuRect1.y).toBe(true)
  })

  test("should close menu on left-click", async ({ page }) => {
    // Right-click to open
    await page.click(contextTrigger(1), { button: "right" })
    await expect(page.locator(menu)).toBeVisible()

    // Left-click to close
    await page.click(contextTrigger(1), { button: "left" })
    await expect(page.locator(menu)).toBeHidden()
  })

  test("should close menu on escape", async ({ page }) => {
    await page.click(contextTrigger(3), { button: "right" })
    await expect(page.locator(menu)).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator(menu)).toBeHidden()
  })
})

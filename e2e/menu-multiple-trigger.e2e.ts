import { expect, test } from "@playwright/test"
import { rect } from "./_utils"

const trigger = (id: number) => `[data-scope="menu"][data-part="trigger"][data-value="${id}"]`
const menu = '[data-scope="menu"][data-part="content"]'
const positioner = '[data-scope="menu"][data-part="positioner"]'

test.describe("menu / multiple triggers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu-multiple-trigger")
  })

  test("should open menu from trigger", async ({ page }) => {
    await page.click(trigger(1))
    await expect(page.locator(menu)).toBeVisible()
    await expect(page.locator(menu)).toBeFocused()
  })

  test("should switch triggers while menu is open", async ({ page }) => {
    // Open from last trigger (5) so menu doesn't cover other triggers
    await page.click(trigger(5))
    await expect(page.locator(menu)).toBeVisible()
    await expect(page.locator(menu)).toContainText("value: 5")

    // Click first trigger - above the menu, so not covered
    await page.click(trigger(1))
    await expect(page.locator(menu)).toBeVisible()
    await expect(page.locator(menu)).toContainText("value: 1")
  })

  test("should reposition menu when switching triggers", async ({ page }) => {
    // Open from last trigger
    await page.click(trigger(5))
    const menuRect1 = await rect(page.locator(positioner))

    // Click first trigger - menu should reposition up
    await page.click(trigger(1))
    await expect(page.locator(menu)).toBeVisible()

    const menuRect2 = await rect(page.locator(positioner))
    // Y position should be different (trigger 1 is above trigger 5)
    expect(menuRect2.y).toBeLessThan(menuRect1.y)
  })

  test("should close menu on escape and focus active trigger", async ({ page }) => {
    await page.click(trigger(3))
    await expect(page.locator(menu)).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator(menu)).toBeHidden()
    await expect(page.locator(trigger(3))).toBeFocused()
  })

  test("should close menu on item selection", async ({ page }) => {
    await page.click(trigger(1))
    await expect(page.locator(menu)).toBeVisible()

    await page.click('[data-value="rename"]')
    await expect(page.locator(menu)).toBeHidden()
  })
})

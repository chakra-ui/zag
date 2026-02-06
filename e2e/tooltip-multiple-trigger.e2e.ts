import { expect, test } from "@playwright/test"
import { rect } from "./_utils"

const trigger = (id: number) => `[data-scope="tooltip"][data-part="trigger"][data-value="${id}"]`
const content = '[data-scope="tooltip"][data-part="content"]'
const positioner = '[data-scope="tooltip"][data-part="positioner"]'

test.describe("tooltip / multiple triggers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tooltip-multiple-trigger")
  })

  test("should open tooltip on hover", async ({ page }) => {
    await page.hover(trigger(1))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Laptop")
  })

  test("should switch triggers on hover", async ({ page }) => {
    // Hover first trigger
    await page.hover(trigger(1))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Laptop")

    // Hover different trigger - tooltip should show different content
    await page.hover(trigger(3))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Keyboard")
  })

  test("should reposition when switching triggers", async ({ page }) => {
    // Hover last trigger
    await page.hover(trigger(5))
    await expect(page.locator(content)).toBeVisible()
    const pos1 = await rect(page.locator(positioner))

    // Hover first trigger
    await page.hover(trigger(1))
    await expect(page.locator(content)).toBeVisible()
    const pos2 = await rect(page.locator(positioner))

    // Y position should be different
    expect(pos2.y).toBeLessThan(pos1.y)
  })

  test("should close tooltip on mouse leave", async ({ page }) => {
    await page.hover(trigger(1))
    await expect(page.locator(content)).toBeVisible()

    // Move mouse away
    await page.mouse.move(0, 0)
    await expect(page.locator(content)).toBeHidden()
  })

  test("should open tooltip on keyboard focus", async ({ page }) => {
    // Focus trigger 2 directly, then Shift+Tab to trigger 1
    // This establishes keyboard modality via Tab navigation
    await page.locator(trigger(2)).focus()
    await page.keyboard.press("Shift+Tab")
    await expect(page.locator(trigger(1))).toBeFocused()
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Laptop")
  })

  test("should close tooltip on escape", async ({ page }) => {
    await page.hover(trigger(1))
    await expect(page.locator(content)).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator(content)).toBeHidden()
  })

  test("should switch triggers on keyboard navigation", async ({ page }) => {
    // Click first trigger then use Tab to navigate
    await page.click(trigger(1))
    await expect(page.locator(trigger(1))).toBeFocused()

    // Tab to next trigger - tooltip should switch (trigger 2 = Mouse)
    await page.keyboard.press("Tab")
    await expect(page.locator(trigger(2))).toBeFocused()
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Mouse")
  })
})

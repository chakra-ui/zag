import { expect, test } from "@playwright/test"
import { rect } from "./_utils"

const trigger = (id: number) => `[data-scope="hover-card"][data-part="trigger"][data-value="${id}"]`
const content = '[data-scope="hover-card"][data-part="content"]'
const positioner = '[data-scope="hover-card"][data-part="positioner"]'

test.describe("hover-card / multiple triggers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/hover-card-multiple-trigger")
  })

  test("should open hover card on hover", async ({ page }) => {
    await page.hover(trigger(1))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Alice Johnson")
  })

  test("should switch triggers on hover", async ({ page }) => {
    // Hover first trigger
    await page.hover(trigger(1))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Alice Johnson")

    // Hover different trigger - hover card should show different content
    await page.hover(trigger(3))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Charlie Brown")
  })

  test("should reposition when switching triggers", async ({ page }) => {
    // Hover first trigger
    await page.hover(trigger(1))
    await expect(page.locator(content)).toBeVisible()
    const pos1 = await rect(page.locator(positioner))

    // Hover last trigger
    await page.hover(trigger(4))
    await expect(page.locator(content)).toBeVisible()
    const pos2 = await rect(page.locator(positioner))

    // X position should be different (triggers are side by side)
    expect(pos2.x).not.toBe(pos1.x)
  })

  test("should close hover card on mouse leave", async ({ page }) => {
    await page.hover(trigger(1))
    await expect(page.locator(content)).toBeVisible()

    // Move mouse away
    await page.mouse.move(0, 0)
    await expect(page.locator(content)).toBeHidden()
  })

  test("should open hover card on keyboard focus", async ({ page }) => {
    // Focus trigger 2, then Shift+Tab to trigger 1 to establish keyboard modality
    await page.locator(trigger(2)).focus()
    await page.keyboard.press("Shift+Tab")
    await expect(page.locator(trigger(1))).toBeFocused()
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Alice Johnson")
  })

  test("should close hover card on escape", async ({ page }) => {
    await page.hover(trigger(1))
    await expect(page.locator(content)).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator(content)).toBeHidden()
  })

  test("should switch triggers on keyboard navigation", async ({ page }) => {
    // Focus trigger 1 then Tab to trigger 2
    await page.locator(trigger(1)).focus()
    await expect(page.locator(trigger(1))).toBeFocused()

    // Tab to next trigger - hover card should switch (trigger 2 = Bob Smith)
    await page.keyboard.press("Tab")
    await expect(page.locator(trigger(2))).toBeFocused()
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Bob Smith")
  })
})

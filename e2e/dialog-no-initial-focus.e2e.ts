import { expect, test } from "@playwright/test"

const OUTSIDE = "[data-testid=outside-input]"
const OPEN = "[data-testid=open-button]"

test.describe("dialog / no initial focus", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dialog/no-initial-focus")
  })

  test("should not move focus when initialFocusEl returns false", async ({ page }) => {
    await page.focus(OUTSIDE)
    await expect(page.locator(OUTSIDE)).toBeFocused()

    // open programmatically so nothing inside the dialog is clicked
    await page.locator(OPEN).evaluate((node: HTMLButtonElement) => node.click())
    await expect(page.locator("[data-part=content]")).toBeVisible()

    await expect(page.locator(OUTSIDE)).toBeFocused()
  })

  test("should still trap focus on Tab", async ({ page }) => {
    await page.focus(OUTSIDE)
    await page.locator(OPEN).evaluate((node: HTMLButtonElement) => node.click())
    await expect(page.locator("[data-part=content]")).toBeVisible()

    await page.keyboard.press("Tab")
    await expect(page.locator("[data-part=content] >> nth=0")).toContainText("Special offer")
    const inside = await page.evaluate(
      () => !!document.querySelector("[data-part=content]")?.contains(document.activeElement),
    )
    expect(inside).toBe(true)
  })

  test("should still close on Escape", async ({ page }) => {
    await page.locator(OPEN).evaluate((node: HTMLButtonElement) => node.click())
    await expect(page.locator("[data-part=content]")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator("[data-part=content]")).toBeHidden()
  })
})

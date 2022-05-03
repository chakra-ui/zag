import { expect, test } from "@playwright/test"
import { testid } from "./__utils"

const item = (id: string) => ({
  trigger: testid(id + "-trigger"),
  tooltip: testid(id + "-tooltip"),
})

const tooltip_1 = item("tip-1")
const tooltip_2 = item("tip-2")

test.describe("tooltip", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tooltip")
  })

  test("should open tooltip on hover interaction", async ({ page }) => {
    await page.hover(tooltip_1.trigger)
    await expect(page.locator(tooltip_1.tooltip)).toBeVisible()
    await page.mouse.move(0, 0)
    await expect(page.locator(tooltip_1.tooltip)).not.toBeVisible()
  })

  test("should show only one tooltip at a time", async ({ page }) => {
    await page.hover(tooltip_1.trigger)
    await page.hover(tooltip_2.trigger)
    await expect(page.locator(tooltip_1.tooltip)).not.toBeVisible()
    await expect(page.locator(tooltip_2.tooltip)).toBeVisible()
  })

  test("should work with focus/blur", async ({ page }) => {
    await page.focus(tooltip_1.trigger)
    await expect(page.locator(tooltip_1.tooltip)).toBeVisible()
    await page.click("body", { force: true })
    await expect(page.locator(tooltip_1.tooltip)).not.toBeVisible()
  })

  test("should work with focus/blur for multiple tooltips", async ({ page }) => {
    await page.focus(tooltip_1.trigger)
    await expect(page.locator(tooltip_1.tooltip)).toBeVisible()

    await page.keyboard.press("Tab")
    await expect(page.locator(tooltip_2.trigger)).toBeFocused()

    await expect(page.locator(tooltip_1.tooltip)).not.toBeVisible()
    await expect(page.locator(tooltip_2.tooltip)).toBeVisible()
  })

  test("closes on pointerdown", async ({ page }) => {
    await page.hover(tooltip_1.trigger)
    await expect(page.locator(tooltip_1.tooltip)).toBeVisible()
    const el = page.locator(tooltip_1.trigger)
    await el.dispatchEvent("pointerdown", { button: 0 })
    await expect(page.locator(tooltip_1.tooltip)).not.toBeVisible()
  })

  test("closes on esc press", async ({ page }) => {
    await page.focus(tooltip_1.trigger)
    await page.keyboard.press("Escape")
    await expect(page.locator(tooltip_1.tooltip)).not.toBeVisible()
  })
})

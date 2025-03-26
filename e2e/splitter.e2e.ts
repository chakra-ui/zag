import { test, expect } from "@playwright/test"
import { a11y, controls, testid, part } from "./_utils"

test.describe("splitter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/splitter")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test("should be focused on next splitter when tabbed", async ({ page }) => {
    await page.click(part("root"))
    await page.keyboard.press("Tab")

    expect(page.locator(testid("trigger-b:c"))).toHaveAttribute("data-focus", "")
  })

  test("should increase panel when arrow right pressed", async ({ page }) => {
    await page.click("main")

    await page.keyboard.press("Tab")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")

    expect(page.locator(part("resize-trigger")).nth(1)).toHaveAttribute("aria-valuenow", "36")
  })

  test("should decrease panel when arrow left pressed", async ({ page }) => {
    await page.click("main")

    await page.keyboard.press("Tab")
    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowLeft")
    await page.keyboard.press("ArrowLeft")

    expect(page.locator(part("resize-trigger")).nth(1)).toHaveAttribute("aria-valuenow", "30")
  })

  test("should manage splitter panels when vertical orientation", async ({ page }) => {
    await controls(page).select("orientation", "vertical")

    expect(page.locator(part("root"))).toHaveAttribute("data-orientation", "vertical")
    expect(page.locator(part("panel")).first()).toHaveAttribute("data-orientation", "vertical")
    expect(page.locator(part("resize-trigger")).first()).toHaveAttribute("data-orientation", "vertical")
  })
})

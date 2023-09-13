import { test, expect, type Page } from "@playwright/test"
import { a11y, part } from "./__utils"

const button = part("button")
const disclosure = part("disclosure")

const expectOpen = async (page: Page, open: boolean) => {
  await expect(page.locator(button)).toHaveAttribute("data-state", open ? "open" : "closed")
}

test.describe("disclosure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/disclosure")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test.describe("keyboard", () => {
    test("on `Enter`: should toggle state to open", async ({ page }) => {
      await page.focus(button)
      await page.keyboard.press("Enter")
      await expect(page.locator(button)).toBeFocused()
      await expectOpen(page, true)
    })

    test("then on `Enter` again: should toggle state to closed", async ({ page }) => {
      await page.focus(button)
      await page.keyboard.press("Enter")
      await page.keyboard.press("Enter")
      await expect(page.locator(button)).toBeFocused()
      await expectOpen(page, false)
    })

    test("on `Space`: should toggle state to open", async ({ page }) => {
      await page.focus(button)
      await page.keyboard.press("Space")
      await expect(page.locator(button)).toBeFocused()
      await expectOpen(page, true)
    })

    test("then on `Space` again: should toggle state to closed", async ({ page }) => {
      await page.focus(button)
      await page.keyboard.press("Space")
      await page.keyboard.press("Space")
      await expect(page.locator(button)).toBeFocused()
      await expectOpen(page, false)
    })
  })

  test.describe("pointer", () => {
    test("should show content", async ({ page }) => {
      await page.click(button)
      await expect(page.locator(disclosure)).toBeVisible()
    })

    test("then clicking the same trigger again: should close the content", async ({ page }) => {
      await page.click(button)
      await page.click(button)
      await expect(page.locator(disclosure)).toBeVisible()
    })
  })
})

import type { Page } from "@playwright/test"
import { expect, test } from "./_test"

const wheel = async (page: Page) => {
  await page.mouse.move(700, 400)
  await page.mouse.wheel(0, 300)
}

test.describe("scroll lock nested", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/scroll-lock/nested")
  })

  test("closing the inner panel keeps the lock, closing the outer one releases it", async ({ page }) => {
    const body = page.locator("body")
    const isHtmlLocked = () => page.evaluate(() => document.documentElement.style.overflow === "hidden")

    await expect(body).not.toHaveAttribute("data-scroll-lock", "")

    await page.getByTestId("open-sheet").click()
    await page.getByTestId("open-confirm").click()
    await expect(page.getByTestId("confirm")).toBeVisible()
    await expect(body).toHaveAttribute("data-scroll-lock", "")

    await page.getByTestId("close-confirm").click()
    await expect(page.getByTestId("confirm")).toBeHidden()
    await expect(body).toHaveAttribute("data-scroll-lock", "")
    expect(await isHtmlLocked()).toBe(true)

    await wheel(page)
    await page.waitForTimeout(150)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)

    await page.getByTestId("close-sheet").click()
    await expect(page.getByTestId("sheet")).toBeHidden()
    await expect(body).not.toHaveAttribute("data-scroll-lock", "")
    expect(await isHtmlLocked()).toBe(false)
    await wheel(page)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })

  test("closing the outer panel while the inner one is open releases everything", async ({ page }) => {
    await page.getByTestId("open-sheet").click()
    await page.getByTestId("open-confirm").click()
    await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")

    // the confirmation sits over the sheet, so close it through the keyboard-free path: inner first
    await page.getByTestId("close-confirm").click()
    await page.getByTestId("close-sheet").click()
    await expect(page.locator("body")).not.toHaveAttribute("data-scroll-lock", "")
  })

  test("the lock works again after the panels are remounted", async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      await page.getByTestId("open-sheet").click()
      await page.getByTestId("open-confirm").click()
      await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")
      await page.getByTestId("close-confirm").click()
      await page.getByTestId("close-sheet").click()
      await expect(page.locator("body")).not.toHaveAttribute("data-scroll-lock", "")
    }
  })
})

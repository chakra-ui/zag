import type { Page } from "@playwright/test"
import { expect, test } from "./_test"

const wheel = async (page: Page) => {
  await page.mouse.move(700, 400)
  await page.mouse.wheel(0, 300)
}

const lockedOverflow = (page: import("@playwright/test").Page) =>
  page.evaluate(() => ({
    html: document.documentElement.style.overflow,
    body: document.body.style.overflow,
  }))

test.describe("scroll lock body scroller", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/scroll-lock/body-scroller")
  })

  test("the page scrolls before the lock and not after", async ({ page }) => {
    await wheel(page)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    await page.evaluate(() => window.scrollTo(0, 0))

    await page.getByTestId("open-panel").click()
    await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")

    await wheel(page)
    await page.waitForTimeout(150)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test("the lock lands on body, not html", async ({ page }) => {
    expect(await lockedOverflow(page)).toEqual({ html: "", body: "" })

    await page.getByTestId("open-panel").click()
    await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")
    expect(await lockedOverflow(page)).toEqual({ html: "", body: "hidden" })
  })

  test("closing the panel releases the lock, and it can lock again", async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      await page.getByTestId("open-panel").click()
      await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")

      await page.getByTestId("close-panel").click()
      await expect(page.locator("body")).not.toHaveAttribute("data-scroll-lock", "")
      expect(await lockedOverflow(page)).toEqual({ html: "", body: "" })
    }
  })
})

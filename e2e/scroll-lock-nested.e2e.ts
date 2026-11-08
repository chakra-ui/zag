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
    await expect(page.getByTestId("confirm")).toBeVisible()
    await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")

    // the confirmation's backdrop covers the sheet, so reach its close button with the keyboard
    await page.getByTestId("close-sheet").focus()
    await page.keyboard.press("Enter")

    await expect(page.getByTestId("sheet")).toBeHidden()
    await expect(page.getByTestId("confirm")).toBeHidden()
    await expect(page.locator("body")).not.toHaveAttribute("data-scroll-lock", "")
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("")
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("")
  })

  test("navigating away while both panels are open releases the lock", async ({ page }) => {
    await page.evaluate(() => ((window as any).__spa = true))
    await page.getByTestId("open-sheet").click()
    await page.getByTestId("open-confirm").click()
    await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")

    await page.getByRole("link", { name: "All components" }).dispatchEvent("click")

    await expect(page).toHaveURL(/\/$/)
    expect(await page.evaluate(() => (window as any).__spa)).toBe(true) // client-side, not a reload
    await expect(page.locator("body")).not.toHaveAttribute("data-scroll-lock", "")
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("")
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("")
  })
})

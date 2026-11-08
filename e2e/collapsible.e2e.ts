import type { Page } from "@playwright/test"
import { expect, test } from "./_test"
import { a11y, part } from "./_utils"

const trigger = part("collapsible", "trigger")
const content = part("collapsible", "content")

test.describe("collapsible", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/collapsible/basic")
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test("[toggle] should be open when clicked", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(content)).toBeVisible()

    await page.click(trigger)
    await expect(page.locator(content)).not.toBeVisible()
  })

  test.skip("[closed] content should not be reachable via tab key", async ({ page }) => {
    await page.click(trigger)
    await page.click(trigger)
    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: "Open" })).toBeFocused()
  })
})

test.describe("collapsible find in page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/collapsible/find-in-page")
  })

  /** Mirrors the browser's find-in-page reveal: fire `beforematch`, then drop `hidden` */
  const revealByFind = (page: Page) =>
    page.locator(content).evaluate((el) => {
      el.dispatchEvent(new Event("beforematch"))
      el.removeAttribute("hidden")
    })

  test("closed content stays searchable", async ({ page }) => {
    await expect(page.locator(content)).toHaveAttribute("hidden", "until-found")
  })

  test("a match opens the content", async ({ page }) => {
    await revealByFind(page)
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(trigger)).toHaveAttribute("aria-expanded", "true")
  })

  test("closing found content makes it searchable again", async ({ page }) => {
    await revealByFind(page)
    await expect(page.locator(content)).toBeVisible()
    await page.click(trigger)
    await expect(page.locator(content)).toHaveAttribute("hidden", "until-found")
  })
})

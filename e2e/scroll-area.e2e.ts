import { expect, test } from "@playwright/test"
import { a11y } from "./_utils"

const root = "[data-scope=scroll-area][data-part=root]"
const viewport = "[data-scope=scroll-area][data-part=viewport]"

test.describe("scroll-area", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/scroll-area/basic")
    // wait for the first measurement: the overflow attributes match the viewport's geometry
    await expect
      .poll(() =>
        page.locator(viewport).evaluate((el) => ({
          x: el.hasAttribute("data-overflow-x") === el.scrollWidth > el.clientWidth,
          y: el.hasAttribute("data-overflow-y") === el.scrollHeight > el.clientHeight,
        })),
      )
      .toEqual({ x: true, y: true })
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page, root)
  })

  test("viewport should be a tab stop when it overflows", async ({ page }) => {
    await expect(page.locator(viewport)).toHaveAttribute("tabindex", "0")
  })
})

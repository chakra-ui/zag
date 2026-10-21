import { expect, test, type Page } from "@playwright/test"
import { a11y } from "./_utils"

const root = "[data-scroll-area-root]"
const viewport = "[data-scroll-area-viewport]"

const scrollbar = (page: Page, orientation: string) =>
  page.locator(`[data-scroll-area-scrollbar][data-orientation=${orientation}]`)
const thumb = (page: Page, orientation: string) =>
  page.locator(`[data-scroll-area-thumb][data-orientation=${orientation}]`)

test("dragging the vertical thumb only marks the vertical axis", async ({ page }) => {
  await page.goto("/scroll-area/basic")

  const box = (await thumb(page, "vertical").boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()

  await expect(thumb(page, "vertical")).toHaveAttribute("data-dragging", "")
  await expect(scrollbar(page, "vertical")).toHaveAttribute("data-dragging", "")
  await expect(thumb(page, "horizontal")).not.toHaveAttribute("data-dragging")
  await expect(scrollbar(page, "horizontal")).not.toHaveAttribute("data-dragging")
})

test.describe("viewport", () => {
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

  test("should be a tab stop when it overflows", async ({ page }) => {
    await expect(page.locator(viewport)).toHaveAttribute("tabindex", "0")
  })
})

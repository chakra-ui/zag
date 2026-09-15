import { expect, test } from "@playwright/test"

const TRIGGER = "[data-scope=floating-panel][data-part=trigger]"
const POSITIONER = "[data-scope=floating-panel][data-part=positioner]"

const offsetInBoundary = (page: any) =>
  page.evaluate(() => {
    const p = document.querySelector("[data-scope=floating-panel][data-part=positioner]")!.getBoundingClientRect()
    const b = document.querySelector("[data-testid=boundary]")!.getBoundingClientRect()
    return { top: Math.round(p.top - b.top), left: Math.round(p.left - b.left) }
  })

// scroll by a fraction of the scrollable range, so the test never overscrolls
const scrollToRatio = (page: any, ratio: number) =>
  page.evaluate((r: number) => {
    const el = document.querySelector("[data-testid=scroller]") as HTMLElement
    el.scrollTop = (el.scrollHeight - el.clientHeight) * r
    return el.scrollTop
  }, ratio)

test.describe("floating-panel / boundary", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/floating-panel/boundary")
    await page.click(TRIGGER)
    await expect(page.locator(POSITIONER)).toBeVisible()
  })

  test("should keep its offset within the boundary while scrolling", async ({ page }) => {
    const before = await offsetInBoundary(page)

    await scrollToRatio(page, 1)
    await expect.poll(async () => await offsetInBoundary(page)).toEqual(before)

    await scrollToRatio(page, 0.5)
    await expect.poll(async () => await offsetInBoundary(page)).toEqual(before)

    await scrollToRatio(page, 0)
    await expect.poll(async () => await offsetInBoundary(page)).toEqual(before)
  })

  test("should stay visually inside the boundary after scrolling", async ({ page }) => {
    await scrollToRatio(page, 1)
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const p = document.querySelector("[data-scope=floating-panel][data-part=positioner]")!.getBoundingClientRect()
          const b = document.querySelector("[data-testid=boundary]")!.getBoundingClientRect()
          return p.top >= b.top - 1 && p.bottom <= b.bottom + 1
        }),
      )
      .toBe(true)
  })
})

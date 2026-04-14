import { expect, test } from "@playwright/test"
import { Model } from "./models/model"

/** Standalone virtualizer examples (see shared/src/routes.ts). */
const virtualizerRoutes = [
  "/virtualizer/list",
  "/virtualizer/grid",
  "/virtualizer/padding",
  "/virtualizer/sticky",
  "/virtualizer/window",
] as const

/** Heavy perf comparison pages (large item counts). */
const virtualizerPerfRoutes = ["/virtualizer/perf", "/virtualizer/perf-variable", "/virtualizer/perf-dynamic"] as const

/** Components integrating @zag-js/virtualizer. */
const virtualizedComponentRoutes = [
  "/select/virtualized",
  "/combobox/virtualized",
  "/listbox/virtualized",
  "/gridlist/virtualized",
  "/tree-view/virtualized",
  "/dnd/virtualized",
] as const

test.describe("virtualizer examples", () => {
  for (const path of virtualizerRoutes) {
    test(`smoke ${path}`, async ({ page }) => {
      const I = new Model(page)
      await page.goto(path)
      await page.waitForSelector("main", { state: "visible" })
      await I.dontSeeInConsole("flushSync was called from inside a lifecycle method", 3000)
      await I.checkAccessibility("main")

      if (path === "/virtualizer/window") {
        // Layout uses `main { overflow-y: auto }` — scroll the main element, not the window.
        const main = page.locator("main")
        await main.evaluate((el) => {
          el.scrollTop = 400
        })
        await expect.poll(async () => main.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)

        // Verify a scroll-to button works (triggers smooth scroll on the real scroll target).
        await page.getByRole("button", { name: "Scroll to top" }).click()
        await expect.poll(async () => main.evaluate((el) => el.scrollTop), { timeout: 5000 }).toBeLessThan(10)
      } else {
        const overflow = page.locator("main").locator("div[style*='overflow']").first()
        if ((await overflow.count()) > 0) {
          await overflow.evaluate((el) => {
            el.scrollTop = 400
          })
          await expect.poll(async () => overflow.evaluate((el) => (el as HTMLElement).scrollTop)).toBeGreaterThan(0)
        }
      }
    })
  }

  test.describe("perf comparisons", () => {
    test.describe.configure({ timeout: 120_000 })

    for (const path of virtualizerPerfRoutes) {
      test(`smoke ${path} — Zag and TanStack panels`, async ({ page }) => {
        const I = new Model(page)
        await page.goto(path)
        await page.waitForSelector("main", { state: "visible" })
        await I.dontSeeInConsole("flushSync was called from inside a lifecycle method", 3000)
        await expect(page.getByRole("heading", { name: "@zag-js/virtualizer" })).toBeVisible()
        await expect(page.getByRole("heading", { name: "@tanstack/react-virtual" })).toBeVisible()
        await I.checkAccessibility("main")
      })
    }
  })

  for (const path of virtualizedComponentRoutes) {
    test(`smoke ${path}`, async ({ page }) => {
      const I = new Model(page)
      await page.goto(path)
      await page.waitForSelector("main", { state: "visible" })
      await I.dontSeeInConsole("flushSync was called from inside a lifecycle method", 3000)
      await I.checkAccessibility("main")
    })
  }
})

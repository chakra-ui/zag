import { expect, test } from "@playwright/test"
import { Model } from "./models/model"

/** Standalone virtualizer examples (see shared/src/routes.ts). */
const virtualizerRoutes = [
  "/virtualizer/list",
  "/virtualizer/grid",
  "/virtualizer/padding",
  "/virtualizer/scroll-padding",
  "/virtualizer/sticky",
  "/virtualizer/infinite-scroll",
  "/virtualizer/chat",
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

  test("chat example follows appended messages only when pinned", async ({ page }) => {
    await page.goto("/virtualizer/chat")
    await page.waitForSelector("main", { state: "visible" })

    const transcript = page.getByLabel("Chat transcript")
    const distanceFromEnd = () =>
      transcript.evaluate((el) => {
        const element = el as HTMLElement
        return element.scrollHeight - element.clientHeight - element.scrollTop
      })

    await expect.poll(distanceFromEnd, { timeout: 5000 }).toBeLessThan(2)

    await page.getByRole("button", { name: "Append message" }).click()
    await expect.poll(distanceFromEnd, { timeout: 5000 }).toBeLessThan(2)

    await transcript.evaluate((el) => {
      const element = el as HTMLElement
      element.scrollTop = 240
      element.dispatchEvent(new Event("scroll", { bubbles: true }))
    })
    const readingHistoryOffset = await transcript.evaluate((el) => (el as HTMLElement).scrollTop)
    expect(readingHistoryOffset).toBeGreaterThan(100)

    await page.getByRole("button", { name: "Append message" }).click()
    await page.waitForTimeout(100)
    await expect
      .poll(() => transcript.evaluate((el) => (el as HTMLElement).scrollTop))
      .toBeLessThanOrEqual(readingHistoryOffset + 2)

    await page.getByRole("button", { name: "Jump to latest" }).click()
    await expect.poll(distanceFromEnd, { timeout: 5000 }).toBeLessThan(2)
  })

  test("chat example auto-loads older messages without losing the visible item", async ({ page }) => {
    await page.goto("/virtualizer/chat")
    await page.waitForSelector("main", { state: "visible" })

    const transcript = page.getByLabel("Chat transcript")

    await transcript.evaluate((el) => {
      const element = el as HTMLElement
      element.scrollTop = 0
      element.dispatchEvent(new Event("scroll", { bubbles: true }))
    })

    await expect(page.getByText("Loading...")).toBeVisible()
    await expect(page.getByText("Messages: 48")).toBeVisible({ timeout: 5000 })
    await expect(transcript.getByText(/message 0\./)).toBeVisible()
    await expect.poll(() => transcript.evaluate((el) => (el as HTMLElement).scrollTop)).toBeGreaterThan(100)
  })

  test("chat example keeps streamed output pinned when at latest", async ({ page }) => {
    await page.goto("/virtualizer/chat")
    await page.waitForSelector("main", { state: "visible" })

    const transcript = page.getByLabel("Chat transcript")
    const distanceFromEnd = () =>
      transcript.evaluate((el) => {
        const element = el as HTMLElement
        return element.scrollHeight - element.clientHeight - element.scrollTop
      })

    await expect.poll(distanceFromEnd, { timeout: 5000 }).toBeLessThan(2)

    await page.getByRole("button", { name: "Stream reply" }).click()
    await expect(page.getByRole("button", { name: "Streaming..." })).toBeDisabled()
    await expect(page.getByText(/viewport remains pinned only when you are already at the latest message/)).toBeVisible(
      {
        timeout: 5000,
      },
    )
    await expect.poll(distanceFromEnd, { timeout: 5000 }).toBeLessThan(2)
  })
})

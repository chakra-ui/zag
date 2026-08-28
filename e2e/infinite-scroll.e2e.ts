import { expect, test } from "@playwright/test"
import { InfiniteScrollModel } from "./models/infinite-scroll.model"

let I: InfiniteScrollModel

const PAGE_SIZE = 20
const TOTAL = 100

test.describe("infinite scroll", () => {
  test.beforeEach(async ({ page }) => {
    I = new InfiniteScrollModel(page)
  })

  test.describe("basic", () => {
    test.beforeEach(async () => {
      await I.goto("basic")
      await I.waitForSettled()
    })

    // The machine emits almost no aria of its own — this guards the reference markup, since
    // the scroll container (and its `tabIndex`) is the consumer's responsibility.
    test("should have no accessibility violations", async () => {
      await I.checkAccessibility()
    })

    test("loads the first page without scrolling", async () => {
      await I.seeItemCount(PAGE_SIZE)
      await I.seeStatus("idle")
    })

    test("loads exactly one page per scroll, never two", async () => {
      // the machine tears the observer down while loading, so pages cannot overlap
      for (let page = 2; page <= 4; page++) {
        await I.scrollToEnd()
        await expect(I.getItems()).toHaveCount(PAGE_SIZE * page)
      }
    })

    test("stops at the end and reports complete", async () => {
      await I.loadUntilComplete()
      await I.seeItemCount(TOTAL)
      await I.seeStatus("complete")
    })

    test("shows the complete indicator and hides the loading one when done", async () => {
      await I.loadUntilComplete()
      await I.seeIndicator("complete")
      await I.dontSeeIndicator("loading")
    })

    test("does not keep loading once complete", async () => {
      await I.loadUntilComplete()
      const { before, after } = await I.hammerSentinel(6)
      expect(after).toBe(before)
      expect(after).toBe(TOTAL)
    })
  })

  test.describe("chat reverse / edge start", () => {
    test.beforeEach(async () => {
      await I.goto("chat-reverse")
      await I.waitForSettled()
    })

    test("loads older messages when scrolling to the start edge", async () => {
      const before = await I.countItems()
      await I.scrollToStart()
      await expect(I.getItems()).not.toHaveCount(before)
    })

    test("keeps the viewport anchored when messages are prepended", async () => {
      // the whole point of edge:start — prepending must not move what you are reading
      const drift = await I.measureAnchorDrift()
      expect(drift).not.toBeNull()
      expect(drift!).toBeLessThanOrEqual(2)
    })
  })

  test.describe("controlled loading", () => {
    test.beforeEach(async () => {
      await I.goto("controlled")
      await I.waitForSettled()
    })

    test("cycles idle -> loading -> idle from the controlled prop", async () => {
      await I.seeStatus("idle")
      await I.scrollToEnd()
      await I.seeStatus("loading")
      await I.seeStatus("idle")
    })

    test("reaches completion", async () => {
      await I.loadUntilComplete()
      await I.seeStatus("complete")
    })
  })

  test.describe("manual trigger", () => {
    test.beforeEach(async () => {
      await I.goto("load-more-trigger")
      await I.waitForSettled()
    })

    test("loads a page when the button is clicked", async () => {
      const before = await I.countItems()
      await I.clickLoadMore()
      await expect(I.getItems()).toHaveCount(before + PAGE_SIZE)
    })

    test("disabled pauses auto-loading but not the manual trigger", async () => {
      await I.toggleAutoLoading()
      const before = await I.countItems()

      const paused = await I.hammerSentinel(3)
      expect(paused.after).toBe(before)

      await I.clickLoadMore()
      await expect(I.getItems()).toHaveCount(before + PAGE_SIZE)

      // the manual load must land back in the paused state, not re-arm the observer
      const stillPaused = await I.hammerSentinel(3)
      expect(stillPaused.after).toBe(before + PAGE_SIZE)
    })
  })

  test.describe("horizontal", () => {
    test.beforeEach(async () => {
      await I.goto("horizontal")
      await I.waitForSettled()
    })

    test("scrolls on the inline axis rather than growing to fit its content", async () => {
      const { scrollWidth, clientWidth } = await I.getScroller().evaluate((el) => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      }))
      expect(scrollWidth).toBeGreaterThan(clientWidth)
    })
  })

  test.describe("window scroll", () => {
    test.beforeEach(async () => {
      await I.goto("window-scroll")
      await I.waitForSettled()
    })

    test("loads when the page itself is the scroller", async () => {
      await I.loadUntilComplete()
      await I.seeIndicator("complete")
    })
  })
})

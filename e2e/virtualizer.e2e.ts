import { expect, test } from "./_test"
import {
  ListVirtualizerModel,
  TableVirtualizerModel,
  VirtualizedListboxModel,
  VirtualizerModel,
  WindowVirtualizerModel,
} from "./models/virtualizer.model"

const isReact = !process.env.FRAMEWORK || process.env.FRAMEWORK === "react"

const virtualizerRoutes = [
  "/virtualizer/list",
  "/virtualizer/grid",
  "/virtualizer/padding",
  "/virtualizer/scroll-padding",
  "/virtualizer/sticky",
  "/virtualizer/infinite-scroll",
  "/virtualizer/table",
] as const

const perfRoutes = ["/virtualizer/perf", "/virtualizer/perf-variable", "/virtualizer/perf-dynamic"] as const

const componentRoutes = [
  "/select/virtualized",
  "/combobox/virtualized",
  "/listbox/virtualized",
  "/gridlist/virtualized",
  "/tree-view/virtualized",
  "/dnd/virtualized",
] as const

test.describe("virtualizer / fixed-size list", () => {
  test.skip(!isReact, "React perf example")

  test("reaches both ends from the keyboard", async ({ page }) => {
    const I = new ListVirtualizerModel(page, "Zag virtualizer performance list")
    await I.goto("/virtualizer/perf")

    await I.focus()

    await I.pressKey("End")
    await I.seeRowInViewport(99999)
    await I.seeViewportCovered()

    await I.pressKey("Home")
    await I.seeRowInViewport(0)
    await I.seeViewportCovered()
  })

  test("renders a window of rows after scrolling", async ({ page }) => {
    const I = new ListVirtualizerModel(page, "Zag virtualizer performance list")
    await I.goto("/virtualizer/perf")

    await I.scrollTo({ top: 12_000 })

    await I.seeRowInViewport(300)
    await I.seeViewportCovered()
    await I.seeRenderedRowsFewerThan(40)
    await I.seeRowHeight(300, 40)
  })
})

test.describe("virtualizer / retained items", () => {
  test.skip(!isReact, "React retention example")

  test("keeps the active listbox option mounted when scrolling away", async ({ page }) => {
    const I = new VirtualizedListboxModel(page)
    await I.goto("/listbox/virtualized")

    await I.focus()
    await I.pressKey("Home")
    await I.seeActiveItem(0)

    await I.wheel(1800)
    await I.seeScrollTopGreaterThan(1000)

    await I.seeActiveItem(0)
    await I.seeActiveOptionMounted({ posinset: 1, setsize: 10000 })
    await I.seeFocused()
    await I.seeOptionsFewerThan(100)

    await I.pressKey("ArrowDown")

    await I.seeActiveItem(1)
    await I.seeScrollTopLessThan(100)
    await expect(I.option("Item 1")).toBeVisible()
  })
})

test.describe("virtualizer / table", () => {
  let I: TableVirtualizerModel

  test.beforeEach(async ({ page }) => {
    I = new TableVirtualizerModel(page)
    await I.goto("/virtualizer/table")
  })

  test("windows rows and columns", async () => {
    await I.seeRenderedRowsFewerThan(40)
    await I.seeColumnsFewerThan(20)
    await I.dontSeeColumn(60)
  })

  test("keeps header and body columns aligned after scrolling", async () => {
    await I.scrollTo({ top: 2000, left: 3000 })

    await I.seeColumnRendered(30)
    await I.seeColumnAligned(60, 30)
    await I.seeViewportCovered()
  })

  test("keeps the pinned column at the start edge", async () => {
    await I.scrollTo({ left: 3000 })

    await I.seeColumnRendered(30)
    await I.seeColumnPinnedAt(0, 1)
  })

  test("scrolls to the last column from the keyboard", async () => {
    await I.focus()
    await I.pressKey("End")

    await I.seeColumnRendered(60)
    await I.seeHeaderColumnFullyVisible(60)
    await I.seeStatus("Metric 60")
  })

  test("pages rows from the keyboard and keeps the active row mounted", async () => {
    await I.focus()
    await I.pressKey("PageDown", 3)
    await I.seeStatus("Active 31")

    await I.scrollTo({ top: 6000 })

    await I.seeRowRetainedOutOfLayout(30)
  })

  test("loads more rows at the end", async () => {
    await I.seeStatus("Loaded 200 of")

    await I.scrollTo({ top: 100_000 })

    await I.seeStatus("Loaded 400 of")
  })
})

test.describe("virtualizer / window", () => {
  test("scrolls the document and scrolls back to the top", async ({ page }) => {
    const I = new WindowVirtualizerModel(page)
    await I.goto("/virtualizer/window")

    await I.seeNoFlushSyncWarning()
    await I.checkAccessibility("main")

    await I.scrollDocumentTo(400)
    await I.seeDocumentScrollTopGreaterThan(0)

    await I.clickButton("Scroll to top")
    await I.seeDocumentScrollTopLessThan(10)
  })
})

test.describe("virtualizer / smoke", () => {
  for (const path of virtualizerRoutes) {
    test(path, async ({ page }) => {
      const I = new VirtualizerModel(page, (p) => p.locator("main").locator("div[style*='overflow']").first())
      await I.goto(path)

      await I.seeNoFlushSyncWarning()
      await I.checkAccessibility("main")

      await I.scrollTo({ top: 400 })
      await I.seeScrollTopGreaterThan(0)
    })
  }

  for (const path of componentRoutes) {
    test(path, async ({ page }) => {
      const I = new VirtualizerModel(page, (p) => p.locator("main"))
      await I.goto(path)

      await I.seeNoFlushSyncWarning()
      await I.checkAccessibility("main")
    })
  }
})

test.describe("virtualizer / perf smoke", () => {
  test.describe.configure({ timeout: 120_000 })

  for (const path of perfRoutes) {
    test(path, async ({ page }) => {
      const I = new VirtualizerModel(page, (p) => p.locator("main"))
      await I.goto(path)

      await I.seeNoFlushSyncWarning()
      await expect(page.getByRole("heading", { name: "@zag-js/virtualizer" })).toBeVisible()
      await expect(page.getByRole("heading", { name: /tanstack/i })).toBeVisible()
      await I.checkAccessibility("main")
    })
  }
})

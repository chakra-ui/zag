import { expect, type Locator, type Page } from "@playwright/test"
import { Model } from "./model"

type ScrollPosition = { top?: number; left?: number }

export class VirtualizerModel extends Model {
  constructor(
    page: Page,
    private readonly getScroller: (page: Page) => Locator,
  ) {
    super(page)
  }

  async goto(url: string) {
    await this.page.goto(url)
    await this.page.waitForSelector("main", { state: "visible" })
  }

  get scroller() {
    return this.getScroller(this.page)
  }

  get rows() {
    return this.scroller.locator("[data-index]")
  }

  row(index: number) {
    return this.scroller.locator(`[data-index="${index}"]`)
  }

  focus() {
    return this.scroller.focus()
  }

  scrollTop() {
    return this.scroller.evaluate((el) => el.scrollTop)
  }

  scrollLeft() {
    return this.scroller.evaluate((el) => Math.abs(el.scrollLeft))
  }

  scrollTo({ top, left }: ScrollPosition) {
    return this.scroller.evaluate(
      (el, position) => {
        if (position.top !== undefined) el.scrollTop = position.top
        if (position.left !== undefined) el.scrollLeft = position.left
      },
      { top, left },
    )
  }

  async wheel(deltaY: number, deltaX = 0) {
    const box = await this.scroller.boundingBox()
    if (!box) throw new Error("Scroller is not visible")
    await this.page.mouse.move(box.x + box.width - 12, box.y + box.height / 2)
    await this.page.mouse.wheel(deltaX, deltaY)
  }

  renderedIndexes() {
    return this.rows.evaluateAll((rows) => rows.map((row) => Number(row.getAttribute("data-index"))))
  }

  isViewportCovered() {
    return this.scroller.evaluate((element) => {
      const viewport = element.getBoundingClientRect()
      const top = viewport.top + element.clientTop
      const bottom = top + element.clientHeight

      const rows = Array.from(element.querySelectorAll("[data-index]"), (row) => row.getBoundingClientRect())
        .filter((row) => row.height > 0 && row.bottom > top && row.top < bottom)
        .sort((a, b) => a.top - b.top)

      let coveredUntil = top
      for (const row of rows) {
        if (row.top > coveredUntil + 1) return false
        coveredUntil = Math.max(coveredUntil, row.bottom)
      }

      return coveredUntil >= bottom - 1
    })
  }

  async seeViewportCovered() {
    await expect.poll(() => this.isViewportCovered()).toBe(true)
  }

  async seeScrollTopGreaterThan(value: number) {
    await expect.poll(() => this.scrollTop()).toBeGreaterThan(value)
  }

  async seeScrollTopLessThan(value: number) {
    await expect.poll(() => this.scrollTop()).toBeLessThan(value)
  }

  async seeRowInViewport(index: number) {
    await expect(this.row(index)).toBeInViewport()
  }

  async dontSeeRow(index: number) {
    await expect(this.row(index)).toHaveCount(0)
  }

  async seeRenderedRowsFewerThan(count: number) {
    expect(await this.rows.count()).toBeLessThan(count)
  }

  async seeRowHeight(index: number, height: number) {
    expect(await this.row(index).evaluate((row) => row.getBoundingClientRect().height)).toBe(height)
  }

  async seeNoFlushSyncWarning() {
    await this.dontSeeInConsole("flushSync was called from inside a lifecycle method", 3000)
  }

  /**
   * Where the highlighted, focused or active item sits within the area its scroll container leaves
   * visible, after `scroll-padding`, a sticky header and a sticky pinned cell.
   */
  activeItemPlacement() {
    return this.scroller.evaluate((root) => {
      const id =
        root.getAttribute("aria-activedescendant") || document.activeElement?.getAttribute("aria-activedescendant")

      const item =
        (id && document.getElementById(id)) ||
        (root.contains(document.activeElement) && document.activeElement !== root ? document.activeElement : null) ||
        root.querySelector("[data-highlighted], [data-active]")

      if (!item) return null

      let scroller = item.parentElement
      while (
        scroller &&
        !(scroller.scrollHeight > scroller.clientHeight && /auto|scroll/.test(getComputedStyle(scroller).overflowY))
      ) {
        scroller = scroller.parentElement
      }
      if (!scroller) return null

      const style = getComputedStyle(scroller)
      const rect = scroller.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()

      const header = scroller.querySelector("thead")
      const row = item.closest("tr")
      const pinned = row
        ? [...row.children].find((cell) => cell !== item && getComputedStyle(cell).position === "sticky")
        : null

      // Like the browser, scroll-padding only matters where the list can still scroll
      const canScrollUp = scroller.scrollTop > 0
      const canScrollDown = scroller.scrollTop < scroller.scrollHeight - scroller.clientHeight - 1
      const scrollPaddingTop = canScrollUp ? parseFloat(style.scrollPaddingTop) || 0 : 0
      const scrollPaddingBottom = canScrollDown ? parseFloat(style.scrollPaddingBottom) || 0 : 0

      const top = Math.max(
        rect.top + scroller.clientTop + scrollPaddingTop,
        header?.getBoundingClientRect().bottom ?? -Infinity,
      )
      const bottom = rect.top + scroller.clientTop + scroller.clientHeight - scrollPaddingBottom
      const left = Math.max(rect.left + scroller.clientLeft, pinned?.getBoundingClientRect().right ?? -Infinity)
      const right = rect.left + scroller.clientLeft + scroller.clientWidth

      return {
        hiddenPixels: Math.round(
          Math.max(0, top - itemRect.top) +
            Math.max(0, itemRect.bottom - bottom) +
            Math.max(0, left - itemRect.left) +
            Math.max(0, itemRect.right - right),
        ),
        offsetFromCenter: Math.round((itemRect.top + itemRect.bottom) / 2 - (top + bottom) / 2),
        itemSize: Math.round(itemRect.height),
        atScrollEnd: !canScrollDown,
      }
    })
  }

  async seeActiveItemFullyVisible() {
    await expect.poll(async () => (await this.activeItemPlacement())?.hiddenPixels).toBe(0)
  }

  /** Centered within one item, unless the list can't scroll any further. */
  async seeActiveItemCentered() {
    await expect
      .poll(async () => {
        const placement = await this.activeItemPlacement()
        if (!placement) return false
        return placement.atScrollEnd || Math.abs(placement.offsetFromCenter) <= placement.itemSize
      })
      .toBe(true)
  }

  /** Presses the key repeatedly, checking the active item stays fully visible after each press. */
  async pressKeyKeepingActiveItemVisible(key: string, times: number) {
    for (let i = 0; i < times; i++) {
      await this.pressKey(key)
      await this.seeActiveItemFullyVisible()
    }
  }

  /** Presses the key repeatedly, checking each press scrolls by no more than one item. */
  async pressKeyScrollingOneItemAtATime(key: string, times: number) {
    for (let i = 0; i < times; i++) {
      const before = await this.scrollTop()
      await this.pressKey(key)
      await this.seeActiveItemFullyVisible()

      const placement = await this.activeItemPlacement()
      expect(Math.abs((await this.scrollTop()) - before)).toBeLessThanOrEqual(placement!.itemSize)
    }
  }

  async seeOpen() {
    await expect(this.scroller).toBeVisible()
  }

  async seeClosed() {
    await expect(this.scroller).toBeHidden()
  }

  async seeScrollTop(value: number) {
    await expect.poll(() => this.scrollTop()).toBe(value)
  }
}

export class ListVirtualizerModel extends VirtualizerModel {
  constructor(page: Page, label: string) {
    super(page, (p) => p.getByLabel(label, { exact: true }))
  }
}

export class WindowVirtualizerModel extends VirtualizerModel {
  constructor(page: Page) {
    super(page, (p) => p.locator("main"))
  }

  documentScrollTop() {
    return this.page.evaluate(() => document.documentElement.scrollTop)
  }

  scrollDocumentTo(top: number) {
    return this.page.evaluate((value) => {
      document.documentElement.scrollTop = value
    }, top)
  }

  async seeDocumentScrollTopGreaterThan(value: number) {
    await expect.poll(() => this.documentScrollTop()).toBeGreaterThan(value)
  }

  async seeDocumentScrollTopLessThan(value: number) {
    await expect.poll(() => this.documentScrollTop(), { timeout: 5000 }).toBeLessThan(value)
  }

  clickButton(name: string) {
    return this.page.getByRole("button", { name }).click()
  }
}

export class TableVirtualizerModel extends VirtualizerModel {
  constructor(page: Page, label = "Customers") {
    super(page, (p) => p.getByRole("region", { name: label }))
  }

  get table() {
    return this.scroller.locator("table")
  }

  get bodyRows() {
    return this.scroller.locator("tbody tr[data-index]")
  }

  get headerCells() {
    return this.scroller.locator("thead th[aria-colindex]")
  }

  headerCell(column: number) {
    return this.scroller.locator(`thead th[aria-colindex="${column + 1}"]`)
  }

  cell(row: number, column: number) {
    return this.row(row).locator(`[aria-colindex="${column + 1}"]`)
  }

  renderedColumns() {
    return this.headerCells.evaluateAll((cells) => cells.map((cell) => Number(cell.getAttribute("aria-colindex")) - 1))
  }

  private offsetLeft(locator: Locator) {
    return locator.evaluate((el) => {
      const scroller = el.closest("[role=region]")!
      return Math.round(el.getBoundingClientRect().left - scroller.getBoundingClientRect().left)
    })
  }

  async seeColumnsFewerThan(count: number) {
    expect((await this.renderedColumns()).length).toBeLessThan(count)
  }

  async seeColumnRendered(column: number) {
    await expect(this.headerCell(column)).toBeAttached()
  }

  async dontSeeColumn(column: number) {
    await expect(this.headerCell(column)).toHaveCount(0)
  }

  async seeColumnAligned(row: number, column: number) {
    expect(await this.offsetLeft(this.cell(row, column))).toBe(await this.offsetLeft(this.headerCell(column)))
  }

  async seeColumnPinnedAt(column: number, left: number) {
    await expect.poll(() => this.offsetLeft(this.headerCell(column))).toBe(left)
  }

  async seeHeaderColumnFullyVisible(column: number) {
    await expect(this.headerCell(column)).toBeInViewport({ ratio: 1 })
  }

  async seeRowRetainedOutOfLayout(index: number) {
    await expect(this.row(index)).toBeAttached()
    await expect(this.row(index)).toHaveCSS("position", "absolute")
  }

  async seeStatus(text: string | RegExp) {
    await expect(this.page.locator("main p").last()).toContainText(text)
  }
}

export class VirtualizedListboxModel extends VirtualizerModel {
  constructor(page: Page) {
    super(page, (p) => p.getByRole("listbox"))
  }

  get activeOption() {
    return this.scroller.evaluate((el) => el.getAttribute("aria-activedescendant"))
  }

  option(name: string) {
    return this.scroller.getByRole("option", { name, exact: true })
  }

  async seeActiveItem(index: number) {
    await expect(this.scroller).toHaveAttribute("aria-activedescendant", new RegExp(`item-${index}$`))
  }

  async seeActiveOptionMounted(position: { posinset: number; setsize: number }) {
    const id = await this.activeOption
    const option = this.page.locator(`[id="${id}"]`)
    await expect(option).toBeAttached()
    await expect(option).toHaveAttribute("aria-posinset", String(position.posinset))
    await expect(option).toHaveAttribute("aria-setsize", String(position.setsize))
  }

  async seeFocused() {
    await expect(this.scroller).toBeFocused()
  }

  async seeOptionsFewerThan(count: number) {
    expect(await this.scroller.getByRole("option").count()).toBeLessThan(count)
  }
}

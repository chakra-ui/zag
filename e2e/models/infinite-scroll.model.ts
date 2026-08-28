import { expect, type Page } from "@playwright/test"
import { part } from "../_utils"
import { Model } from "./model"

type Route = "basic" | "chat-reverse" | "controlled" | "horizontal" | "load-more-trigger" | "window-scroll"

const scroller = ".infinite-scroll .scroller"
const sentinel = part("infinite-scroll", "sentinel")
const indicator = part("infinite-scroll", "indicator")

export class InfiniteScrollModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(route: Route = "basic") {
    return this.page.goto(`/infinite-scroll/${route}`)
  }

  getScroller() {
    return this.page.locator(scroller)
  }

  getSentinel() {
    return this.page.locator(sentinel)
  }

  getIndicator(type: "loading" | "complete") {
    return this.page.locator(`${indicator}[data-type="${type}"]`)
  }

  getItems() {
    return this.page.locator("main li, main .card")
  }

  /**
   * The element that actually scrolls, or `main` when the page is the scroller. Resolved by
   * presence rather than a comma selector, which Playwright resolves in DOM order and would
   * match the `main` ancestor.
   */
  private async scrollEl() {
    const el = this.page.locator(scroller)
    return (await el.count()) ? el.first() : this.page.locator("main")
  }

  /** `data-state` lives on the indicator parts — the scroll container is the consumer's. */
  private statusEl() {
    return this.page.locator(indicator).first()
  }

  countItems() {
    return this.getItems().count()
  }

  async seeItemCount(count: number) {
    await expect(this.getItems()).toHaveCount(count)
  }

  async seeStatus(status: "idle" | "loading" | "complete") {
    await expect(this.statusEl()).toHaveAttribute("data-state", status)
  }

  async seeIndicator(type: "loading" | "complete") {
    await expect(this.getIndicator(type)).toBeVisible()
  }

  async dontSeeIndicator(type: "loading" | "complete") {
    await expect(this.getIndicator(type)).toBeHidden()
  }

  async scrollToEnd() {
    const el = await this.scrollEl()
    await el.evaluate((node) => {
      node.scrollTop = node.scrollHeight
      node.scrollLeft = node.scrollWidth
    })
  }

  async scrollToStart() {
    const el = await this.scrollEl()
    await el.evaluate((node) => {
      node.scrollTop = 0
      node.scrollLeft = 0
    })
  }

  /**
   * Waits for the first page, then until the list stops growing, so assertions do not race an
   * in-flight load. Waiting for an item first matters: polling alone "settles" at zero.
   */
  async waitForSettled() {
    await this.getItems().first().waitFor({ state: "attached" })
    // not every example renders an indicator, and the scroll container is the consumer's, so
    // `data-state` may be absent entirely — settle on the item count alone
    let previous = -1
    let stable = 0
    for (let i = 0; i < 40; i++) {
      const current = await this.countItems()
      // autofill leaves an idle gap between pages, so one stable reading is not enough
      stable = current === previous ? stable + 1 : 0
      if (stable >= 3) return current
      previous = current
      await this.page.waitForTimeout(300)
    }
    return previous
  }

  async loadUntilComplete(maxScrolls = 12) {
    const status = this.statusEl()
    for (let i = 0; i < maxScrolls; i++) {
      if ((await status.getAttribute("data-state")) === "complete") return
      await this.scrollToEnd()
      await this.page.waitForTimeout(400)
    }
  }

  clickLoadMore() {
    return this.page.getByRole("button", { name: /load more/i }).click()
  }

  toggleAutoLoading() {
    return this.page.getByRole("checkbox", { name: /disable auto-loading/i }).click()
  }

  /**
   * Scrolls to the leading edge and reports how far a known item moved once the new page landed.
   * A correctly anchored list keeps it exactly where it was, so this should be ~0.
   */
  async measureAnchorDrift() {
    return this.page.evaluate(async (sel) => {
      const vp = document.querySelector(sel) as HTMLElement
      const items = [...document.querySelectorAll("main li")]
      if (!items.length) return null
      const probe = items[Math.floor(items.length / 2)] as HTMLElement
      const label = probe.textContent
      const scrollTopBefore = vp.scrollTop
      const topBefore = probe.getBoundingClientRect().top

      vp.scrollTop = 0
      const shiftFromScroll = scrollTopBefore - vp.scrollTop

      const countBefore = items.length
      const deadline = Date.now() + 5000
      while (document.querySelectorAll("main li").length === countBefore && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 50))
      }
      // wait for the load to fully settle: a leading-edge indicator occupies space while
      // visible, and would otherwise be measured as content
      while (vp.getAttribute("data-state") === "loading" && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 50))
      }
      await new Promise((r) => setTimeout(r, 300))

      const after = [...document.querySelectorAll("main li")].find((el) => el.textContent === label)
      if (!after) return null
      const observed = (after as HTMLElement).getBoundingClientRect().top - topBefore
      return Math.abs(observed - shiftFromScroll)
    }, scroller)
  }

  /** Crosses the sentinel repeatedly and reports whether the list grew as a result. */
  async hammerSentinel(times: number) {
    const before = await this.countItems()
    for (let i = 0; i < times; i++) {
      await this.scrollToStart()
      await this.page.waitForTimeout(60)
      await this.scrollToEnd()
      await this.page.waitForTimeout(60)
    }
    await this.page.waitForTimeout(600)
    return { before, after: await this.countItems() }
  }
}

import { expect, type Page } from "@playwright/test"
import { a11y, mouseSwipe, part, touchPointerSwipe, touchSwipe } from "../_utils"
import { Model } from "./model"

const content = part("content")
const trigger = part("trigger")
const grabber = part("grabber")
const backdrop = part("backdrop")

export class DrawerModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, "[data-part=content]", ["scrollable-region-focusable"])
  }

  goto(url = "/drawer/basic") {
    return this.page.goto(url)
  }

  private get trigger() {
    return this.page.locator(trigger)
  }

  private get content() {
    return this.page.locator(content)
  }

  private get backdrop() {
    return this.page.locator(backdrop)
  }

  private get grabber() {
    return this.page.locator(grabber)
  }

  private get swipeAreaEl() {
    return this.page.locator(part("swipe-area"))
  }

  private get noDragArea() {
    return this.page.locator("[data-no-drag]")
  }

  private get scrollable() {
    return this.page.locator("[data-testid=scrollable]")
  }

  clickTrigger(opts: { delay?: number } = {}) {
    return this.trigger.click(opts)
  }

  clickBackdrop() {
    return this.backdrop.click()
  }

  mouseDragGrabber(direction: "up" | "down", distance: number = 100, duration = 500, release = true) {
    return mouseSwipe(this.page, this.grabber, direction, distance, duration, release)
  }

  touchDragGrabber(direction: "up" | "down", distance: number = 100, duration = 500) {
    return touchSwipe(this.page, this.grabber, direction, distance, duration)
  }

  touchPointerDragGrabber(direction: "up" | "down", distance: number = 100, duration = 500) {
    return touchPointerSwipe(this.page, this.grabber, direction, distance, duration)
  }

  dragContent(direction: "up" | "down", distance: number = 100, duration = 500, release = true) {
    return mouseSwipe(this.page, this.content, direction, distance, duration, release)
  }

  async selectTitleText() {
    await this.content.evaluate((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
        },
      })
      const textNode = walker.nextNode()
      if (!textNode) throw new Error("Selectable text node not found in drawer content")

      const selection = window.getSelection()
      if (!selection) throw new Error("Window selection unavailable")

      const range = document.createRange()
      range.selectNodeContents(textNode)
      selection.removeAllRanges()
      selection.addRange(range)
    })
  }

  getSelectedText() {
    return this.page.evaluate(() => window.getSelection()?.toString() ?? "")
  }

  hasSelectionInContent() {
    return this.content.evaluate((el) => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false
      const range = selection.getRangeAt(0)
      return el.contains(range.commonAncestorContainer)
    })
  }

  dragNoDragArea(direction: "up" | "down", distance: number = 100, duration = 500, release = true) {
    return mouseSwipe(this.page, this.noDragArea, direction, distance, duration, release)
  }

  swipeArea(direction: "up" | "down", distance: number = 100, duration = 500, release = true) {
    if (!release) {
      return mouseSwipe(this.page, this.swipeAreaEl, direction, distance, duration, release)
    }
    return touchSwipe(this.page, this.swipeAreaEl, direction, distance, duration)
  }

  seeContent() {
    return expect(this.content).toBeVisible()
  }

  dontSeeContent() {
    return expect(this.content).not.toBeVisible()
  }

  seeBackdrop() {
    return expect(this.backdrop).toBeVisible()
  }

  dontSeeBackdrop() {
    return expect(this.backdrop).not.toBeVisible()
  }

  seeTriggerIsFocused() {
    return expect(this.trigger).toBeFocused()
  }

  seeContentIsFocused() {
    return expect(this.content).toBeFocused()
  }

  async getContentVisibleHeight() {
    const isVisible = await this.content.isVisible()
    if (!isVisible) return 0

    const initialHeight = await this.content.evaluate((el) => el.clientHeight)

    const translateY = await this.content.evaluate((el) => getComputedStyle(el).getPropertyValue("--drawer-translate"))

    const parsedTranslateY = parseFloat(translateY)
    return initialHeight - (isNaN(parsedTranslateY) ? 0 : parsedTranslateY)
  }

  async getContentFullHeight() {
    const isVisible = await this.content.isVisible()
    if (!isVisible) return 0

    return this.content.evaluate((el) => el.clientHeight)
  }

  scrollContent(distance: number) {
    return this.scrollable.evaluate((el, dist) => {
      el.scrollTop += dist
    }, distance)
  }

  async isScrollableAtTop() {
    const scrollTop = await this.scrollable.evaluate((el) => el.scrollTop)
    return scrollTop === 0
  }

  override clickOutside() {
    return this.page.locator("body").click({ force: true, position: { x: 5, y: 5 } })
  }

  async waitForOpenState() {
    // Wait for element to be visible and animations to complete
    await expect(this.content).toBeVisible()
    await this.content.evaluate((el) => Promise.allSettled(el.getAnimations().map((animation) => animation.finished)))
  }

  waitForClosedState() {
    return expect(this.content).toHaveAttribute("data-state", "closed")
  }

  async waitForSnapComplete() {
    // Wait for snap animation/transition to complete after drag
    await this.content.evaluate((el) =>
      Promise.allSettled([...el.getAnimations()].map((animation) => animation.finished)),
    )
  }

  async waitForVisibleHeightNear(targetHeight: number, tolerance = 4, timeout = 2000) {
    await expect
      .poll(async () => Math.abs((await this.getContentVisibleHeight()) - targetHeight), { timeout })
      .toBeLessThanOrEqual(tolerance)
  }
}

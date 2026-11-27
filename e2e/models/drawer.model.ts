import { expect, type Page } from "@playwright/test"
import { a11y, mouseSwipe, part, realTouchSwipe, touchPointerSwipe, touchSwipe, type SwipeDirection } from "../_utils"
import { Model } from "./model"

interface DragOptions {
  direction: "up" | "down"
  distance?: number | undefined
  duration?: number | undefined
  release?: boolean | undefined
}

const content = part("drawer", "content")
const trigger = part("drawer", "trigger")
const grabber = part("drawer", "grabber")
const backdrop = part("drawer", "backdrop")

export class DrawerModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, "[data-drawer-content]", ["scrollable-region-focusable"])
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
    return this.page.locator(part("drawer", "swipe-area"))
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

  mouseDragGrabber({ direction, distance = 100, duration = 500, release = true }: DragOptions) {
    return mouseSwipe(this.page, this.grabber, direction, distance, duration, release)
  }

  /** Drags down from the grabber, with the first move landing on the scrollable list */
  async mouseDragGrabberOverList(distance: number) {
    const grabber = await this.grabber.boundingBox()
    const list = await this.scrollable.boundingBox()
    if (!grabber || !list) throw new Error("Could not determine the grabber or list bounding box.")

    const x = grabber.x + grabber.width / 2
    const y = grabber.y + grabber.height / 2

    await this.page.mouse.move(x, y)
    await this.page.mouse.down()
    await this.page.mouse.move(x, list.y + 20, { steps: 2 })
    await this.page.mouse.move(x, y + distance, { steps: 10 })
    await this.page.mouse.up()
  }

  touchDragGrabber({ direction, distance = 100, duration = 500 }: DragOptions) {
    return touchSwipe(this.page, this.grabber, direction, distance, duration)
  }

  touchPointerDragGrabber({ direction, distance = 100, duration = 500 }: DragOptions) {
    return touchPointerSwipe(this.page, this.grabber, direction, distance, duration)
  }

  dragContent({ direction, distance = 100, duration = 500, release = true }: DragOptions) {
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

  setNoDragAxis(axis: "x" | "y") {
    return this.noDragArea.evaluate((el, value) => el.setAttribute("data-no-drag", value), axis)
  }

  dragNoDragArea({ direction, distance = 100, duration = 500, release = true }: DragOptions) {
    return mouseSwipe(this.page, this.noDragArea, direction, distance, duration, release)
  }

  swipeArea({ direction, distance = 100, duration = 500, release = true }: DragOptions) {
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

  mouseDragGrabberToward({ direction, distance = 300 }: { direction: SwipeDirection; distance?: number }) {
    return mouseSwipe(this.page, this.grabber, direction, distance, 300)
  }

  realTouchDragList({ direction, distance, from = "center" }: DragOptions & { from?: "center" | "edge" }) {
    return realTouchSwipe(this.page, this.scrollable, direction, distance, { from })
  }

  getListScrollTop() {
    return this.scrollable.evaluate((el) => el.scrollTop)
  }

  async seeSide(direction: SwipeDirection) {
    await expect(this.content).toHaveAttribute("data-swipe-direction", direction)
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

  async waitForVisibleHeightNear({
    height: targetHeight,
    tolerance = 4,
    timeout = 2000,
  }: {
    height: number
    tolerance?: number
    timeout?: number
  }) {
    await expect
      .poll(async () => Math.abs((await this.getContentVisibleHeight()) - targetHeight), { timeout })
      .toBeLessThanOrEqual(tolerance)
  }
}

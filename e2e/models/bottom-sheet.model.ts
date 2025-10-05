import { expect, type Page } from "@playwright/test"
import { a11y, part, swipe } from "../_utils"
import { Model } from "./model"

const content = part("content")
const trigger = part("trigger")
const grabber = part("grabber")
const backdrop = part("backdrop")

export class BottomSheetModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, "[data-part=content]", ["scrollable-region-focusable"])
  }

  goto(url = "/bottom-sheet") {
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

  private get noDragArea() {
    return this.page.locator("[data-no-drag]")
  }

  private get scrollable() {
    return this.page.locator(".scrollable")
  }

  clickTrigger(opts: { delay?: number } = {}) {
    return this.trigger.click(opts)
  }

  clickBackdrop() {
    return this.backdrop.click()
  }

  dragGrabber(direction: "up" | "down", distance: number = 100, duration = 500, release = true) {
    return swipe(this.page, this.grabber, direction, distance, duration, release)
  }

  dragContent(direction: "up" | "down", distance: number = 100, duration = 500, release = true) {
    return swipe(this.page, this.content, direction, distance, duration, release)
  }

  dragNoDragArea(direction: "up" | "down", distance: number = 100, duration = 500, release = true) {
    return swipe(this.page, this.noDragArea, direction, distance, duration, release)
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

    const translateY = await this.content.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--bottom-sheet-translate"),
    )

    const parsedTranslateY = parseInt(translateY, 10)
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

  clickOutsideSheet() {
    return this.page.locator("main").click({ position: { x: 5, y: 5 } })
  }

  async waitForOpenState() {
    // Wait for element to be visible and animations to complete
    await expect(this.content).toBeVisible()
    await this.content.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)))
  }

  waitForClosedState() {
    return expect(this.content).toHaveAttribute("data-state", "closed")
  }

  async waitForSnapComplete() {
    // Wait for snap animation/transition to complete after drag
    await this.content.evaluate((el) => Promise.all([...el.getAnimations()].map((animation) => animation.finished)))
  }
}

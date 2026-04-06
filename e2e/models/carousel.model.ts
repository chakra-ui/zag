import { expect, type Page } from "@playwright/test"
import { a11y, mouseSwipe, part, type SwipeDirection } from "../_utils"
import { Model } from "./model"

export class CarouselModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/carousel/basic") {
    return this.page.goto(url)
  }

  checkAccessibility(selector?: string): Promise<void> {
    return a11y(this.page, selector)
  }

  getItem(index: number) {
    return this.page.locator(part("carousel", "item")).nth(index)
  }

  getIndicator(index: number) {
    return this.page.locator(part("carousel", "indicator")).nth(index)
  }

  get prevTrigger() {
    return this.page.locator(part("carousel", "prev-trigger"))
  }

  get nextTrigger() {
    return this.page.locator(part("carousel", "next-trigger"))
  }

  get autoplayTrigger() {
    return this.page.locator(part("carousel", "autoplay-trigger"))
  }

  get carousel() {
    return this.page.locator(part("carousel", "item-group"))
  }

  async clickPrevTrigger() {
    await this.prevTrigger.click()
  }

  async clickNextTrigger() {
    await this.nextTrigger.click()
  }

  async clickAutoplayTrigger() {
    await this.autoplayTrigger.click()
  }

  async clickIndicator(index: number) {
    await this.getIndicator(index).click()
  }

  async focusIndicator(index: number) {
    await this.getIndicator(index).focus()
  }

  async swipeCarousel(direction: SwipeDirection, distance: number = 100, duration: number = 500, release = true) {
    await mouseSwipe(this.page, this.carousel, direction, distance, duration, release)
  }

  async holdDrag(ms: number) {
    await this.page.waitForTimeout(ms)
  }

  async releaseDrag() {
    await this.page.mouse.up()
  }

  async wheelCarousel(deltaX: number, deltaY = 0) {
    const box = await this.carousel.boundingBox()
    if (!box) throw new Error("Could not determine carousel bounding box.")
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await this.page.mouse.wheel(deltaX, deltaY)
  }

  async waitForScrollSettle(timeout = 1500) {
    await this.carousel.evaluate(async (el, timeoutMs) => {
      const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

      if ("onscrollend" in el) {
        await new Promise<void>((resolve) => {
          const id = window.setTimeout(resolve, timeoutMs)
          const done = () => {
            window.clearTimeout(id)
            resolve()
          }
          el.addEventListener("scrollend", done, { once: true })
        })
        return
      }

      let previous = Number.NaN
      let stableFrames = 0
      const maxFrames = Math.ceil(timeoutMs / 16)
      const orientation = (el as HTMLElement).dataset.orientation
      const axis = orientation === "vertical" ? "y" : "x"

      for (let frame = 0; frame < maxFrames; frame++) {
        await wait(16)
        const current = axis === "x" ? (el as HTMLElement).scrollLeft : (el as HTMLElement).scrollTop
        if (Math.abs(current - previous) < 0.5) {
          stableFrames += 1
          if (stableFrames >= 3) return
        } else {
          stableFrames = 0
        }
        previous = current
      }
    }, timeout)
  }

  async clickScrollToButton(index: number) {
    await this.page.getByRole("button", { name: `Scroll to ${index}` }).click()
  }

  async seeAutoplayIsOn() {
    await expect(this.autoplayTrigger).toHaveText("Stop")
  }

  async seeAutoplayIsOff() {
    await expect(this.autoplayTrigger).toHaveText("Play")
  }

  async seeNumOfItems(count: number) {
    await expect(this.carousel).toBeVisible()
    const items = this.page.locator(part("carousel", "item"))
    await expect(items).toHaveCount(count)
  }

  async seeItemInView(index: number) {
    await expect(this.getItem(index)).toHaveAttribute("data-inview", "")
  }

  async seePrevTriggerIsDisabled() {
    await expect(this.prevTrigger).toBeDisabled()
  }

  async seePrevTriggerIsEnabled() {
    await expect(this.prevTrigger).toBeEnabled()
  }

  async seeNextTriggerIsDisabled() {
    await expect(this.nextTrigger).toBeDisabled()
  }

  async seeNextTriggerIsEnabled() {
    await expect(this.nextTrigger).toBeEnabled()
  }

  async dontSeeItemInView(index: number) {
    await expect(this.getItem(index)).not.toHaveAttribute("data-inview", "")
  }

  async seeIndicatorIsActive(index: number) {
    await expect(this.getIndicator(index)).toHaveAttribute("data-current", "")
  }

  async seeIndicatorIsInactive(index: number) {
    await expect(this.getIndicator(index)).not.toHaveAttribute("data-current", "")
  }
}

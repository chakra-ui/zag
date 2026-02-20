import { expect, type Page } from "@playwright/test"
import { a11y, rect } from "../_utils"
import { Model } from "./model"

export class SliderModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/slider") {
    return this.page.goto(url)
  }

  getThumb(index = 0) {
    return this.page.locator(`[data-scope='slider'][data-part='thumb'][data-index='${index}']`)
  }

  get control() {
    return this.page.locator("[data-scope='slider'][data-part='control']")
  }

  get track() {
    return this.page.locator("[data-scope='slider'][data-part='track']")
  }

  get output() {
    return this.page.locator("[data-scope='slider'][data-part='value-text']")
  }

  focusThumb(index?: number) {
    return this.getThumb(index).focus()
  }

  seeValueText(value: string) {
    return expect(this.output).toHaveText(value)
  }

  /**
   * Calculate a point on the track for a given value percentage.
   * Accounts for thumb inset in "contain" alignment mode.
   */
  private async getTrackPoint(percent: { x?: number; y?: number }) {
    const orientation = await this.track.getAttribute("data-orientation")
    const vertical = orientation === "vertical"

    const controlBbox = await rect(this.control)
    const thumbBbox = await rect(this.getThumb(0))

    // Get thumb size for inset calculation (contain mode)
    const thumbSize = vertical ? thumbBbox.height : thumbBbox.width
    const thumbInset = thumbSize / 2

    // Calculate effective range (accounting for thumb inset in contain mode)
    const effectiveStart = vertical ? controlBbox.y + thumbInset : controlBbox.x + thumbInset
    const effectiveSize = vertical ? controlBbox.height - thumbSize : controlBbox.width - thumbSize

    let x: number, y: number

    if (percent.x != null && !vertical) {
      // Map value percentage to actual position accounting for thumb inset
      x = effectiveStart + effectiveSize * percent.x
    } else {
      x = controlBbox.midX
    }

    if (percent.y != null && vertical) {
      // For vertical, y=0 is at the bottom (max value)
      y = effectiveStart + effectiveSize * (1 - percent.y)
    } else {
      y = controlBbox.midY
    }

    return { x, y }
  }

  async mousedownAt(percent: { x?: number; y?: number }) {
    const point = await this.getTrackPoint(percent)
    await this.page.mouse.move(point.x, point.y)
    await this.page.mouse.down()
  }

  async mousemoveTo(percent: { x?: number; y?: number }) {
    const point = await this.getTrackPoint(percent)
    await this.page.mouse.move(point.x, point.y)
  }

  seeThumbIsFocused(index = 0) {
    return expect(this.getThumb(index)).toBeFocused()
  }
}

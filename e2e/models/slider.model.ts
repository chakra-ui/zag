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

  goto(url = "/slider/basic") {
    return this.page.goto(url)
  }

  getThumb(index = 0) {
    return this.page.locator(`[data-slider-thumb][data-index='${index}']`)
  }

  get control() {
    return this.page.locator("[data-slider-control]")
  }

  get track() {
    return this.page.locator("[data-slider-track]")
  }

  get output() {
    return this.page.locator("[data-slider-value-text]")
  }

  get range() {
    return this.page.locator("[data-slider-range]")
  }

  focusThumb(index?: number) {
    return this.getThumb(index).focus()
  }

  seeValueText(value: string) {
    return expect(this.output).toHaveText(value)
  }

  /** The filled range's inset from the control's start/end edges, as a percent of its width. */
  private async getFillPercent() {
    const controlBbox = await rect(this.control)
    const rangeBbox = await rect(this.range)
    const isRtl = (await this.control.getAttribute("dir")) === "rtl"

    const insetFromLeft = ((rangeBbox.x - controlBbox.x) / controlBbox.width) * 100
    const insetFromRight = ((controlBbox.maxX - rangeBbox.maxX) / controlBbox.width) * 100

    return isRtl ? { start: insetFromRight, end: insetFromLeft } : { start: insetFromLeft, end: insetFromRight }
  }

  async seeFillPercent(expected: { start: number; end: number }, tolerance = 1.5) {
    const actual = await this.getFillPercent()
    expect(Math.abs(actual.start - expected.start), "fill start inset").toBeLessThanOrEqual(tolerance)
    expect(Math.abs(actual.end - expected.end), "fill end inset").toBeLessThanOrEqual(tolerance)
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

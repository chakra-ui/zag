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

  private async getTrackPoint(percent: { x?: number; y?: number }) {
    const orientation = await this.track.getAttribute("data-orientation")
    const vertical = orientation === "vertical"

    const bbox = await rect(this.track)
    let x: number, y: number

    if (percent.x != null && !vertical) {
      x = bbox.x + bbox.width * percent.x
    } else {
      x = bbox.midX
    }

    if (percent.y != null && vertical) {
      y = bbox.y + bbox.height * percent.y
    } else {
      y = bbox.midY
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

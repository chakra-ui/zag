import { expect, type Page } from "@playwright/test"
import { a11y, rect } from "../_utils"
import { Model } from "./model"

export class AngleSliderModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/angle-slider") {
    return this.page.goto(url)
  }

  get thumb() {
    return this.page.locator("[data-scope='angle-slider'][data-part='thumb']")
  }

  get control() {
    return this.page.locator("[data-scope='angle-slider'][data-part='control']")
  }

  get output() {
    return this.page.locator("[data-scope='angle-slider'][data-part='value-text']")
  }

  focusThumb() {
    return this.thumb.focus()
  }

  async getCurrentValue(): Promise<string> {
    return (await this.output.textContent()) || "0deg"
  }

  seeValueText(value: string) {
    return expect(this.output).toHaveText(value)
  }

  async setToAngle(angle: number) {
    // Click on control at specific angle to set value
    const controlBbox = await rect(this.control)
    const centerX = controlBbox.x + controlBbox.width / 2
    const centerY = controlBbox.y + controlBbox.height / 2
    const radius = (Math.min(controlBbox.width, controlBbox.height) / 2) * 0.8 // 80% of radius

    const radians = (180 - angle) * (Math.PI / 180)
    const targetX = centerX + radius * Math.sin(radians) // x corresponds to sin in atan2(x,y)
    const targetY = centerY + radius * Math.cos(radians) // y corresponds to cos in atan2(x,y)

    await this.page.mouse.move(targetX, targetY)
    await this.page.mouse.down()
    await this.page.mouse.up()
  }

  async dragThumbRelative({ startAngle, endAngle }: { startAngle: number; endAngle: number }) {
    // First ensure we're at start angle
    await this.setToAngle(startAngle)

    // Get thumb position
    const thumbBbox = await rect(this.thumb)
    const controlBbox = await rect(this.control)

    // Click at edge of thumb (not center) to test relative dragging
    const thumbEdgeX = thumbBbox.x + thumbBbox.width * 0.2 // 20% from left edge
    const thumbEdgeY = thumbBbox.midY

    // Calculate target position for end angle
    const centerX = controlBbox.x + controlBbox.width / 2
    const centerY = controlBbox.y + controlBbox.height / 2
    const radius = (Math.min(controlBbox.width, controlBbox.height) / 2) * 0.8

    const endAngleRad = (endAngle - 90) * (Math.PI / 180)
    const endX = centerX + radius * Math.cos(endAngleRad)
    const endY = centerY + radius * Math.sin(endAngleRad)

    // Drag from thumb edge to target position
    await this.page.mouse.move(thumbEdgeX, thumbEdgeY)
    await this.page.mouse.down()
    await this.page.mouse.move(endX, endY)
    await this.page.mouse.up()
  }
}

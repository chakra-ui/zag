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

  async seeValueText(value: string) {
    return expect(this.output).toHaveText(value)
  }

  async clickControlAtAngle(angle: number) {
    const controlBbox = await rect(this.control)
    const centerX = controlBbox.x + controlBbox.width / 2
    const centerY = controlBbox.y + controlBbox.height / 2
    const radius = (Math.min(controlBbox.width, controlBbox.height) / 2) * 0.8

    // Convert angle to radians (0° is at top, clockwise)
    const radians = ((angle - 90) * Math.PI) / 180
    const targetX = centerX + radius * Math.cos(radians)
    const targetY = centerY + radius * Math.sin(radians)

    await this.page.mouse.click(targetX, targetY)
  }

  async dragThumbFromEdgeToAngle(targetAngle: number) {
    // Get thumb and control positions
    const thumbBbox = await rect(this.thumb)
    const controlBbox = await rect(this.control)

    // Click at edge of thumb (not center) to test relative dragging
    const thumbEdgeX = thumbBbox.x + thumbBbox.width * 0.8
    const thumbEdgeY = thumbBbox.y + thumbBbox.height * 0.2

    // Calculate target position for the desired angle
    const centerX = controlBbox.x + controlBbox.width / 2
    const centerY = controlBbox.y + controlBbox.height / 2
    const radius = (Math.min(controlBbox.width, controlBbox.height) / 2) * 0.8

    const radians = ((targetAngle - 90) * Math.PI) / 180
    const targetX = centerX + radius * Math.cos(radians)
    const targetY = centerY + radius * Math.sin(radians)

    // Drag from thumb edge to target position
    await this.page.mouse.move(thumbEdgeX, thumbEdgeY)
    await this.page.mouse.down()
    await this.page.mouse.move(targetX, targetY)
    await this.page.mouse.up()
  }
}

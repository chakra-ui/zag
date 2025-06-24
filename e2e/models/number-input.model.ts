import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class NumberInputModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto() {
    return this.page.goto("/number-input")
  }

  private get input() {
    return this.page.locator("[data-testid=input]")
  }

  private get incButton() {
    return this.page.locator("[data-testid=inc-button]")
  }

  private get decButton() {
    return this.page.locator("[data-testid=dec-button]")
  }

  private get scrubber() {
    return this.page.locator("[data-testid=scrubber]")
  }

  async type(value: string, options?: { delay: number }) {
    await this.input.focus()
    if (options) {
      return this.input.pressSequentially(value, options)
    } else {
      return this.input.fill(value)
    }
  }

  async seeInputHasValue(value: string) {
    await expect(this.input).toHaveValue(value)
  }

  async seeInputIsInvalid() {
    await expect(this.input).toHaveAttribute("aria-invalid", "true")
  }

  async clickInc() {
    await this.incButton.click()
  }

  async clickDec() {
    await this.decButton.click()
  }

  async scrubBy(x: number) {
    const scrubber = await this.scrubber.boundingBox()
    if (!scrubber) throw new Error("No scrubber found")
    await this.scrubber.hover()
    await this.page.mouse.down()
    await this.page.mouse.move(scrubber.x + scrubber.width / 2 + x, scrubber.y + scrubber.height / 2, { steps: x })
    await this.page.mouse.up()
  }

  async waitForTick(n: number) {
    // these match the delays in the machine
    const CHANGE_INTERVAL = 50
    const CHANGE_DELAY = 300
    const time = CHANGE_INTERVAL * n + CHANGE_DELAY
    await this.wait(time)
  }

  async mousedownInc() {
    await this.incButton.hover()
    await this.page.mouse.down()
  }

  async mousedownDec() {
    await this.decButton.dispatchEvent("pointerdown")
  }
}

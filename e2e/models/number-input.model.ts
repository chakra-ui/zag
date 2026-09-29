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
    return this.page.goto("/number-input/basic")
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

  async typeSequentially(value: string, options?: { delay: number }) {
    return this.input.pressSequentially(value, options)
  }

  /**
   * Types one character at a time from inside the page, the way `@testing-library/user-event` does.
   * `pressSequentially` awaits a round trip per key, which is always longer than a frame, so it can
   * never put two keystrokes in the same one — the interval this covers.
   *
   * The yield between keystrokes is the whole point: it hands the browser a turn, so a frame can
   * fall between two characters. Dispatching them in one synchronous run instead lets every queued
   * write land back to back, which is the case that was never at risk.
   */
  async typeWithinOneFrame(value: string) {
    await this.input.focus()
    await this.page.evaluate(async (text) => {
      const input = document.querySelector<HTMLInputElement>("[data-testid=input]")!
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!
      for (const character of text) {
        const start = input.selectionStart ?? input.value.length
        const end = input.selectionEnd ?? start
        setValue.call(input, input.value.slice(0, start) + character + input.value.slice(end))
        input.setSelectionRange(start + 1, start + 1)
        input.dispatchEvent(new InputEvent("input", { bubbles: true, data: character, inputType: "insertText" }))
        await new Promise((resolve) => setTimeout(resolve))
      }
    }, value)
  }

  async seeInputHasValue(value: string) {
    await expect(this.input).toHaveValue(value)
  }

  async seeInputValueIsApprox(expectedValue: number, tolerance = 1) {
    const inputValue = Number(await this.input.inputValue())
    expect(inputValue).toBeLessThanOrEqual(expectedValue + tolerance)
    expect(inputValue).toBeGreaterThanOrEqual(expectedValue - tolerance)
  }

  async seeInputIsInvalid() {
    await expect(this.input).toHaveAttribute("aria-invalid", "true")
  }

  async seeInputIsValid() {
    const isValid = await this.input.evaluate((el: HTMLInputElement) => el.checkValidity())
    expect(isValid).toBe(true)
  }

  async focusInput() {
    await this.input.focus()
  }

  async selectInput() {
    await this.input.selectText()
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
    await this.decButton.hover()
    await this.page.mouse.down()
  }
}

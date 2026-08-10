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

  goto(url = "/number-input/basic") {
    return this.page.goto(url)
  }

  private get input() {
    return this.testId("input")
  }

  private get incButton() {
    return this.testId("inc-button")
  }

  private get decButton() {
    return this.testId("dec-button")
  }

  private get scrubber() {
    return this.testId("scrubber")
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

  async seeInputHasValue(value: string) {
    await expect(this.input).toHaveValue(value)
  }

  async seeInputValueIsApprox(expectedValue: number, tolerance = 1) {
    const inputValue = Number(await this.input.inputValue())
    expect(inputValue).toBeLessThanOrEqual(expectedValue + tolerance)
    expect(inputValue).toBeGreaterThanOrEqual(expectedValue - tolerance)
  }

  seeChangeReason(reason: string) {
    return this.seeTestIdText("reason", reason)
  }

  seeCommitReason(reason: string) {
    return this.seeTestIdText("commit-reason", reason)
  }

  seeCommitCount(count: number) {
    return this.seeTestIdText("commits", String(count))
  }

  /** Synthetic so no pointerup or pointerleave follows, leaving cancel as the only way out. */
  async pressIncWithTouch() {
    await this.incButton.dispatchEvent("pointerdown", { button: 0, pointerType: "touch" })
  }

  async releaseIncWithTouch() {
    await this.incButton.dispatchEvent("pointercancel", { pointerType: "touch" })
  }

  private async fireContextMenu() {
    return this.page.evaluate(() => {
      const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true })
      document.body.dispatchEvent(event)
      return event.defaultPrevented
    })
  }

  async seeContextMenuIsSuppressed() {
    expect(await this.fireContextMenu()).toBe(true)
  }

  async dontSeeContextMenuIsSuppressed() {
    expect(await this.fireContextMenu()).toBe(false)
  }

  async pressIncThenCancelPointer() {
    await this.incButton.dispatchEvent("pointerdown", { button: 0, pointerType: "mouse" })
    await this.incButton.dispatchEvent("pointercancel", { pointerType: "mouse" })
  }

  async scrubRelease(x = 40) {
    const box = await this.scrubber.boundingBox()
    if (!box) throw new Error("No scrubber found")
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await this.page.mouse.down()
    await this.page.mouse.move(box.x + box.width / 2 + x, box.y + box.height / 2, { steps: 10 })
    await this.page.mouse.up()
  }

  async fillInput(value: string) {
    await this.input.fill(value)
  }

  async blurInput() {
    await this.input.blur()
  }

  clickCurrencyFormat() {
    return this.testId("currency-format").click()
  }

  async seeValueText(value: string) {
    await expect(this.input).toHaveAttribute("aria-valuetext", value)
  }

  async dontSeeValueText() {
    await expect(this.input).not.toHaveAttribute("aria-valuetext", /.*/)
  }

  async seeValueNow(value: string) {
    await expect(this.input).toHaveAttribute("aria-valuenow", value)
  }

  async getInputValue() {
    return this.input.inputValue()
  }

  seeFocusReports(reports: string) {
    return this.seeTestIdText("focus-reports", reports)
  }

  async seeInputIsFocused() {
    await expect(this.input).toBeFocused()
  }

  seeInvalidCount(count: number) {
    return this.seeTestIdText("invalids", String(count))
  }

  seeInvalidReport(report: string) {
    return this.seeTestIdText("invalid-report", report)
  }

  toggleClampValueOnBlur() {
    return this.testId("toggle-clamp-on-blur").click()
  }

  toggleFocusInputOnChange() {
    return this.testId("toggle-focus-on-change").click()
  }

  clickApiSetValue() {
    return this.testId("api-set-value").click()
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

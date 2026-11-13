import { expect, type Page } from "@playwright/test"
import { a11y, testid } from "../_utils"
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

  seeCommitValue(value: string) {
    return this.seeTestIdText("commit-value", value)
  }

  seeCommitCount(count: number) {
    return this.seeTestIdText("commits", String(count))
  }

  /** Synthetic so no pointerup or pointerleave follows, leaving cancel as the only way out. */
  async pressIncWithTouch() {
    await this.incButton.dispatchEvent("pointerdown", { button: 0, pointerType: "touch" })
  }

  async releaseIncWithTouch() {
    await this.incButton.dispatchEvent("pointerup", { button: 0, pointerType: "touch" })
  }

  async cancelIncTouch() {
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

  async seeInputIsTextField() {
    await expect(this.input).toHaveRole("textbox")
    await expect(this.input).not.toHaveAttribute("aria-valuenow")
  }

  seeRoleDescription(value: string | null) {
    if (value === null) return expect(this.input).not.toHaveAttribute("aria-roledescription")
    return expect(this.input).toHaveAttribute("aria-roledescription", value)
  }

  seeNumber(value: string) {
    return expect(this.hiddenInput).toHaveValue(value)
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

  toggleAllowOutOfRange() {
    return this.testId("toggle-allow-out-of-range").click()
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

  /** Activates like a screen reader does: a click with no pointer press */
  async activateInc() {
    await this.incButton.evaluate((el: HTMLElement) => el.click())
  }

  async activateDec() {
    await this.decButton.evaluate((el: HTMLElement) => el.click())
  }

  async scrubBy(x: number) {
    // Pointer lock is granted on Linux but not macOS, and skews synthetic mouse deltas once engaged
    await this.page.evaluate(() => {
      Element.prototype.requestPointerLock = () => Promise.resolve()
    })
    const scrubber = await this.scrubber.boundingBox()
    if (!scrubber) throw new Error("No scrubber found")
    await this.scrubber.hover()
    await this.page.mouse.down()
    await this.page.mouse.move(scrubber.x + scrubber.width / 2 + x, scrubber.y + scrubber.height / 2, {
      steps: Math.abs(x),
    })
    await this.page.mouse.up()
  }

  async scrubVerticallyBy(y: number) {
    await this.page.evaluate(() => {
      Element.prototype.requestPointerLock = () => Promise.resolve()
    })
    const scrubber = await this.scrubber.boundingBox()
    if (!scrubber) throw new Error("No scrubber found")
    await this.scrubber.hover()
    await this.page.mouse.down()
    await this.page.mouse.move(scrubber.x + scrubber.width / 2, scrubber.y + scrubber.height / 2 + y, {
      steps: Math.abs(y),
    })
    await this.page.mouse.up()
  }

  async waitForTick(n: number) {
    // these match the delays in the machine
    const CHANGE_INTERVAL = 60
    const CHANGE_DELAY = 400
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

  async seeSteppersAreDisabled() {
    await expect(this.incButton).toBeDisabled()
    await expect(this.decButton).toBeDisabled()
  }

  async seeIncIsDisabled(disabled = true) {
    if (disabled) await expect(this.incButton).toBeDisabled()
    else await expect(this.incButton).toBeEnabled()
  }

  async seeDecIsDisabled(disabled = true) {
    if (disabled) await expect(this.decButton).toBeDisabled()
    else await expect(this.decButton).toBeEnabled()
  }

  async seeSteppersControlTheInput() {
    const id = await this.input.getAttribute("id")
    await expect(this.incButton).toHaveAttribute("aria-controls", id!)
    await expect(this.decButton).toHaveAttribute("aria-controls", id!)
    await expect(this.incButton).toHaveAttribute("aria-label", "increment value")
    await expect(this.decButton).toHaveAttribute("aria-label", "decrease value")
  }

  async rightClickInc() {
    await this.incButton.click({ button: "right" })
  }

  /** Holds the increment button, waits, then releases */
  async holdInc(ms: number) {
    await this.incButton.hover()
    await this.page.mouse.down()
    await this.wait(ms)
    await this.page.mouse.up()
  }

  clickTestId(id: string) {
    return this.testId(id).click()
  }

  async seeInputIsDisabled() {
    await expect(this.input).toBeDisabled()
  }

  async seeInputIsReadOnly() {
    await expect(this.input).toHaveAttribute("readonly", "")
  }

  get hiddenInput() {
    return this.page.locator(testid("hidden-input"))
  }

  async wheelInput(deltaY: number, opts: { ctrl?: boolean; shift?: boolean; deltaX?: number } = {}) {
    await this.input.focus()
    const box = await this.input.boundingBox()
    if (!box) throw new Error("no input")
    await this.page.mouse.move(box.x + 20, box.y + box.height / 2)
    const key = opts.ctrl ? "Control" : opts.shift ? "Shift" : null
    if (key) await this.page.keyboard.down(key)
    await this.page.mouse.wheel(opts.deltaX ?? 0, deltaY)
    if (key) await this.page.keyboard.up(key)
    await this.wait(100)
  }

  /** Whether a horizontal scroll over the input is left for the page to handle */
  async seeHorizontalScrollIsNotBlocked() {
    await this.input.focus()
    const prevented = await this.input.evaluate((el) => {
      const event = new WheelEvent("wheel", { deltaX: 100, deltaY: 1, bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      return event.defaultPrevented
    })
    expect(prevented).toBe(false)
  }

  async insertText(text: string) {
    await this.input.focus()
    await this.page.keyboard.insertText(text)
  }

  seeInputMode(mode: string) {
    return expect(this.input).toHaveAttribute("inputmode", mode)
  }

  async allowNegatives() {
    await this.controls.num("min", "-1000")
    await expect
      .poll(async () => {
        await this.input.fill("")
        await this.input.focus()
        await this.page.keyboard.insertText("-")
        return this.input.inputValue()
      })
      .toBe("-")
    await this.input.fill("")
  }

  async autofill(value: string) {
    await this.hiddenInput.evaluate((el: HTMLInputElement, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, value)
      el.dispatchEvent(new Event("input", { bubbles: true }))
    }, value)
  }
}

import { expect, type Page } from "@playwright/test"
import { testid } from "../_utils"
import { Model } from "./model"

export class PinInputModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/pin-input/basic") {
    return this.page.goto(url)
  }

  private getInput(index: number) {
    return this.page.locator(testid(`input-${index}`))
  }

  private get clearButton() {
    return this.page.locator(testid("clear-button"))
  }

  private get allInputs() {
    return this.page.locator("[data-pin-input-input]")
  }

  // --- Actions ---

  async fillInput(index: number, value: string) {
    await this.getInput(index).fill(value)
  }

  async focusInput(index: number) {
    await this.getInput(index).focus()
  }

  async clickInput(index: number) {
    await this.getInput(index).click()
  }

  async clickClear() {
    await this.clearButton.click()
  }

  async paste(value: string) {
    await this.page.evaluate((v) => navigator.clipboard.writeText(v), value)
    await this.page.keyboard.press("ControlOrMeta+v")
  }

  async typeWithIme(composing: string, committed: string) {
    const cdp = await this.page.context().newCDPSession(this.page)
    await cdp.send("Input.imeSetComposition", { text: composing, selectionStart: 1, selectionEnd: 1 })
    await cdp.send("Input.insertText", { text: committed })
    await cdp.detach()
  }

  async clickButtonKeepingFocus(id: string) {
    await this.page.locator(testid(id)).evaluate((el) => (el as HTMLElement).click())
  }

  async insertText(index: number, text: string) {
    await this.focusInput(index)
    await this.page.evaluate((text) => document.execCommand("insertText", false, text), text)
  }

  async composeAndroid(index: number, char: string) {
    const input = this.getInput(index)
    await input.dispatchEvent("compositionstart", { data: "" })
    await input.evaluate((el: HTMLInputElement, char) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, char)
      el.dispatchEvent(
        new InputEvent("input", { bubbles: true, data: char, inputType: "insertCompositionText", isComposing: true }),
      )
    }, char)
  }

  async endComposition(index: number, data: string) {
    await this.getInput(index).dispatchEvent("compositionend", { data })
  }

  async addRequiredFieldBeforeInputs() {
    await this.page.locator("main form").evaluate((form) => {
      const input = document.createElement("input")
      input.required = true
      input.dataset.testid = "required-field"
      form.prepend(input)
    })
  }

  async seeRequiredFieldIsFocused() {
    await expect(this.page.locator(testid("required-field"))).toBeFocused()
  }

  async seeButtonIsFocused(id: string) {
    await expect(this.page.locator(testid(id))).toBeFocused()
  }

  async seeComplete() {
    await expect(this.page.locator("[data-pin-input-root]")).toHaveAttribute("data-complete", "")
    for (let i = 1; i <= (await this.allInputs.count()); i++) {
      await expect(this.getInput(i)).toHaveAttribute("data-complete", "")
    }
  }

  async seeInputsAreDisabled() {
    for (let i = 1; i <= (await this.allInputs.count()); i++) {
      await expect(this.getInput(i)).toBeDisabled()
    }
  }

  async fillAll(...values: string[]) {
    for (const value of values) {
      await this.page.keyboard.press(value)
    }
  }

  async trackFormEvents() {
    await this.page.locator("main form").evaluate((form) => {
      form.dataset.submits = "0"
      form.dataset.invalid = "false"
      form.addEventListener("submit", () => (form.dataset.submits = String(Number(form.dataset.submits) + 1)))
      form.addEventListener("invalid", () => (form.dataset.invalid = "true"), true)
    })
  }

  // --- Assertions ---

  async seeFormEvents({ submits, invalid }: { submits: number; invalid: boolean }) {
    const form = this.page.locator("main form")
    await expect(form).toHaveAttribute("data-submits", String(submits))
    await expect(form).toHaveAttribute("data-invalid", String(invalid))
  }

  async seeInputsAreGroupedUnderLabel(name: string) {
    const group = this.page.getByRole("group", { name })
    await expect(group).toBeVisible()
    await expect(group.locator("[data-pin-input-input]")).toHaveCount(await this.allInputs.count())
  }

  async seeInputIsFocused(index: number) {
    await expect(this.getInput(index)).toBeFocused()
  }

  async seeInputIsNotFocused(index: number) {
    await expect(this.getInput(index)).not.toBeFocused()
  }

  async seeInputHasValue(index: number, value: string) {
    await expect(this.getInput(index)).toHaveValue(value)
  }

  async seeValues(...values: string[]) {
    for (let i = 0; i < values.length; i++) {
      await expect(this.getInput(i + 1)).toHaveValue(values[i])
    }
  }

  async seeClearButtonIsFocused() {
    await expect(this.clearButton).toBeFocused()
  }

  async seeInputHasAttribute(index: number, attr: string, value?: string) {
    if (value !== undefined) {
      await expect(this.getInput(index)).toHaveAttribute(attr, value)
    } else {
      await expect(this.getInput(index)).toHaveAttribute(attr, "")
    }
  }

  async dontSeeInputHasAttribute(index: number, attr: string) {
    await expect(this.getInput(index)).not.toHaveAttribute(attr, "")
  }

  async seeTabbableCount(expected: number) {
    const inputs = this.allInputs
    const count = await inputs.count()
    let tabbable = 0
    for (let i = 0; i < count; i++) {
      const tabIndex = await inputs.nth(i).getAttribute("tabindex")
      if (tabIndex === "0") tabbable++
    }
    expect(tabbable).toBe(expected)
  }

  async clickButton(testId: string) {
    await this.page.locator(testid(testId)).click()
  }
}

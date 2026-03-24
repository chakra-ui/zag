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
    return this.page.locator("[data-part=input]")
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

  async fillAll(...values: string[]) {
    for (const value of values) {
      await this.page.keyboard.press(value)
    }
  }

  // --- Assertions ---

  async seeInputIsFocused(index: number) {
    await expect(this.getInput(index)).toBeFocused()
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

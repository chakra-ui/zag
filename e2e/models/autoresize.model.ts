import { expect, type Page } from "@playwright/test"
import { Model } from "./model"

export class AutoresizeModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  async goto(url = "/autoresize/basic") {
    await this.page.goto(url, { waitUntil: "networkidle" })
    await this.textarea.waitFor({ state: "visible" })
  }

  get textarea() {
    return this.page.locator("textarea").first()
  }

  get clearButton() {
    return this.page.getByRole("button", { name: /clear/i })
  }

  get valueOutput() {
    return this.page.getByTestId("value")
  }

  async focusTextarea() {
    await this.textarea.click()
    await expect(this.textarea).toBeFocused()
  }

  async typeInTextarea(value: string) {
    await this.focusTextarea()
    await this.page.keyboard.type(value)
  }

  async pasteInTextarea(value: string) {
    await this.focusTextarea()
    await this.page.evaluate((text) => navigator.clipboard.writeText(text), value)
    await this.page.keyboard.press("ControlOrMeta+v")
  }

  clear() {
    return this.clearButton.click()
  }

  getTextareaHeight() {
    return this.textarea.evaluate((el) => el.getBoundingClientRect().height)
  }

  seeTextareaHasValue(value: string) {
    return expect(this.textarea).toHaveValue(value)
  }

  async seeStateValue(value: string) {
    await expect(this.valueOutput).toHaveText(JSON.stringify(value))
  }

  async seeTextareaGrew(fromHeight: number, minDelta = 5) {
    await expect.poll(async () => this.getTextareaHeight(), { timeout: 5_000 }).toBeGreaterThan(fromHeight + minDelta)
  }
}

import { expect, type Page } from "@playwright/test"
import { repeat, withHost } from "../_utils"
import { Model } from "./model"

const shadowHost = "switch-page"

export class SwitchModel extends Model {
  constructor(public page: Page) {
    super(page, shadowHost)
  }

  goto(url = "/switch") {
    return this.page.goto(url)
  }

  get root() {
    return this.page.locator(withHost(shadowHost, "[data-scope='switch'][data-part='root']"))
  }

  get label() {
    return this.page.locator(withHost(shadowHost, "[data-scope='switch'][data-part='label']"))
  }

  get control() {
    return this.page.locator(withHost(shadowHost, "[data-scope='switch'][data-part='control']"))
  }

  get input() {
    return this.page.locator(withHost(shadowHost, "[data-scope='switch'][data-part='root'] input"))
  }

  async clickCheckbox() {
    return this.root.click()
  }

  async clickLabel(times = 1) {
    await repeat(times, () => this.label.click({ force: true }))
  }

  async focusCheckbox() {
    return this.input.focus()
  }

  async seeCheckboxIsChecked() {
    await expect(this.input).toBeChecked()
  }

  async seeCheckboxIsFocused() {
    await expect(this.input).toBeFocused()
    await expect(this.control).toHaveAttribute("data-focus", "")
  }

  async seeCheckboxIsNotFocused() {
    await expect(this.input).not.toBeFocused()
    await expect(this.control).not.toHaveAttribute("data-focus", "")
  }

  async seeCheckboxIsDisabled() {
    await expect(this.input).toBeDisabled()
    await expect(this.control).toHaveAttribute("data-disabled", "")
  }

  private blurCount = 0

  async trackBlur() {
    await this.page.exposeFunction("trackBlur", () => this.blurCount++)
    await this.input.evaluate((input) => {
      input.addEventListener("blur", (window as any).trackBlur)
    })
  }

  async expectBlurCount(count: number) {
    expect(this.blurCount).toBe(count)
  }
}

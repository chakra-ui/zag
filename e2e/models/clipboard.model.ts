import { expect, type Page } from "@playwright/test"
import { a11y, part } from "../_utils"
import { Model } from "./model"

export class ClipboardModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto() {
    return this.page.goto("/clipboard")
  }

  checkAccessibility(selector?: string): Promise<void> {
    return a11y(this.page, selector)
  }

  getTrigger() {
    return this.page.locator(part("trigger"))
  }

  getContent(text: string) {
    return this.page.locator(part("indicator")).getByText(text)
  }

  async focusTrigger() {
    await this.getTrigger().focus()
  }

  async clickTrigger() {
    await this.getTrigger().click()
  }

  async seeTriggerIsFocused() {
    await expect(this.getTrigger()).toBeFocused()
  }

  async seeContent(text: string) {
    const content = this.getContent(text)
    const hidden = await content.isHidden()

    expect(hidden).not.toBe(true)
  }

  async dontSeeContent(text: string) {
    const content = this.getContent(text)
    const hidden = await content.isHidden()

    expect(hidden).toBe(true)
  }
}

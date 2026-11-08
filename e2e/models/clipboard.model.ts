import { expect, type Page } from "@playwright/test"
import { a11y, part } from "../_utils"
import { Model } from "./model"

export class ClipboardModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  async goto() {
    await this.page.context().grantPermissions(["clipboard-read", "clipboard-write"])
    await this.page.goto("/clipboard/basic")
  }

  readClipboard() {
    return this.page.evaluate(() => navigator.clipboard.readText())
  }

  /** Makes writing fail, like a denied permission */
  async denyClipboardWrite() {
    await this.page.evaluate(() => {
      navigator.clipboard.writeText = () =>
        Promise.reject(new DOMException("Write permission denied", "NotAllowedError"))
    })
  }

  /** Removes the Clipboard API, like a page served over plain http */
  async removeClipboardApi() {
    await this.page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true })
    })
  }

  async copyFromInput() {
    await this.page.getByLabel("Copy this link").focus()
    await this.page.keyboard.press("ControlOrMeta+c")
  }

  seeStatusReports(reports: string) {
    return expect(this.page.getByRole("status", { name: "Status reports" })).toHaveText(reports)
  }

  checkAccessibility(selector?: string): Promise<void> {
    return a11y(this.page, selector)
  }

  getTrigger() {
    return this.page.locator(part("clipboard", "trigger"))
  }

  getContent(text: string) {
    return this.page.locator(part("clipboard", "indicator")).getByText(text)
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
    await expect(this.getContent(text)).toBeVisible()
  }

  async dontSeeContent(text: string) {
    await expect(this.getContent(text)).toBeHidden()
  }

  async seeCopied() {
    await this.seeContent("Copied!")
    await this.dontSeeContent("Copy")
  }

  async seeNotCopied() {
    await this.seeContent("Copy")
    await this.dontSeeContent("Copied!")
  }
}

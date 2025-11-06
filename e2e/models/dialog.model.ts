import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class DialogModel extends Model {
  constructor(
    public page: Page,
    private id: string,
  ) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, "[role=dialog]")
  }

  goto(url = "/dialog-nested") {
    return this.page.goto(url)
  }

  private get trigger() {
    return this.page.locator(`[data-testid='trigger-${this.id}']`)
  }

  private get content() {
    return this.page.locator(`[data-testid='positioner-${this.id}']`)
  }

  private get closeTrigger() {
    return this.page.locator(`[data-testid='close-${this.id}']`)
  }

  clickTrigger(opts: { delay?: number } = {}) {
    return this.trigger.click(opts)
  }

  clickClose() {
    return this.closeTrigger.click()
  }

  seeCloseIsFocused() {
    return expect(this.closeTrigger).toBeFocused()
  }

  seeContent() {
    return expect(this.content).toBeVisible()
  }

  dontSeeContent() {
    return expect(this.content).not.toBeVisible()
  }

  seeTriggerIsFocused() {
    return expect(this.trigger).toBeFocused()
  }
}

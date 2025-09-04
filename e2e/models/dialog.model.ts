import { expect, type Page } from "@playwright/test"
import { a11y, testid, withHost } from "../_utils"
import { Model } from "./model"

const shadowHost = "dialog-nested-page"

export class DialogModel extends Model {
  constructor(
    public page: Page,
    private id: string,
  ) {
    super(page)
  }

  checkAccessibility(selector?: string): Promise<void> {
    return a11y(this.page, "[role=dialog]", shadowHost)
  }

  goto(url = "/dialog-nested") {
    return this.page.goto(url)
  }

  private get trigger() {
    return this.page.locator(withHost(shadowHost, testid(`trigger-${this.id}`)))
  }

  private get content() {
    return this.page.locator(withHost(shadowHost, testid(`positioner-${this.id}`)))
  }

  private get closeTrigger() {
    return this.page.locator(withHost(shadowHost, testid(`close-${this.id}`)))
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

  dontSeeContent() {
    return expect(this.content).not.toBeVisible()
  }

  seeTriggerIsFocused() {
    return expect(this.trigger).toBeFocused()
  }
}

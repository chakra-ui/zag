import { expect, type Page } from "@playwright/test"
import { a11y, a11yInShadow, testid, withHost, FRAMEWORK_CONTEXT } from "../_utils"
import { Model } from "./model"

export class AccordionModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto() {
    return this.page.goto("/accordion")
  }

  checkAccessibility(selector?: string): Promise<void> {
    if (FRAMEWORK_CONTEXT === "shadow-dom") {
      // For Shadow DOM, use the specialized shadow root accessibility scan
      return a11yInShadow(this.page, "accordion-page")
    } else {
      // For Light DOM, use the original scoped approach
      return a11y(this.page, selector)
    }
  }

  getTrigger(id: string) {
    return this.page.locator(withHost("accordion-page", testid(`${id}:trigger`)))
  }

  getContent(id: string) {
    return this.page.locator(withHost("accordion-page", testid(`${id}:content`)))
  }

  async focusTrigger(id: string) {
    await this.getTrigger(id).focus()
  }

  async clickTrigger(id: string) {
    await this.getTrigger(id).click()
  }

  async seeTriggerIsFocused(id: string) {
    await expect(this.getTrigger(id)).toBeFocused()
  }

  async seeContent(id: string) {
    await expect(this.getContent(id)).toBeVisible()
  }

  async dontSeeContent(id: string) {
    await expect(this.getContent(id)).not.toBeVisible()
  }
}

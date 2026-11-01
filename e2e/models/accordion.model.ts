import { expect, type Page } from "@playwright/test"
import { a11y, testid } from "../_utils"
import { Model } from "./model"

export class AccordionModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/accordion/basic") {
    return this.page.goto(url)
  }

  checkAccessibility(selector?: string): Promise<void> {
    return a11y(this.page, selector)
  }

  getTrigger(id: string) {
    return this.page.locator(testid(`${id}:trigger`))
  }

  getContent(id: string) {
    return this.page.locator(testid(`${id}:content`))
  }

  // Examples without test ids: items are found by trigger label or `data-value`
  getTriggerByLabel(label: string) {
    return this.page.getByRole("button", { name: label, exact: true })
  }

  getContentByValue(value: string) {
    return this.page.locator(`[data-accordion-item-content][data-value="${value}"]`)
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

  async seeTriggerIsExpanded(id: string, expanded = true) {
    await expect(this.getTrigger(id)).toHaveAttribute("aria-expanded", String(expanded))
  }

  async seeContent(id: string) {
    await expect(this.getContent(id)).toBeVisible()
  }

  async dontSeeContent(id: string) {
    await expect(this.getContent(id)).not.toBeVisible()
  }

  /** Mirrors the browser's find-in-page reveal: fire `beforematch`, then drop `hidden` */
  async revealByFind(value: string) {
    await this.getContentByValue(value).evaluate((el) => {
      el.dispatchEvent(new Event("beforematch"))
      el.removeAttribute("hidden")
    })
  }
}

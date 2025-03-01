import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class NavigationMenuModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(id?: "viewport" | "nested") {
    return this.page.goto(`/navigation-menu${id ? `-${id}` : ""}`)
  }

  checkAccessibility(selector?: string): Promise<void> {
    return a11y(this.page, selector)
  }

  getTrigger(value: string) {
    return this.page.locator(`[data-scope="navigation-menu"][data-part="trigger"][data-value="${value}"]`)
  }

  getContent(value: string) {
    return this.page.locator(`[data-scope="navigation-menu"][data-part="content"][data-value="${value}"]`)
  }

  getViewport() {
    return this.page.locator(`[data-scope="navigation-menu"][data-part="viewport"]`)
  }

  getLink(value: string, text: string) {
    return this.getContent(value).locator("a", { hasText: text })
  }

  async focusTrigger(value: string) {
    await this.getTrigger(value).focus()
  }

  async clickTrigger(value: string) {
    await this.getTrigger(value).click()
  }

  async hoverTrigger(value: string) {
    await this.getTrigger(value).hover()
  }

  async seeTriggerIsFocused(value: string) {
    await expect(this.getTrigger(value)).toBeFocused()
  }

  async seeContent(value: string) {
    await expect(this.getContent(value)).toBeVisible()
  }

  async dontSeeContent(value: string) {
    await expect(this.getContent(value)).not.toBeVisible()
  }
}

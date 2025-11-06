import { expect, type Page } from "@playwright/test"
import { a11y, testid } from "../_utils"
import { Model } from "./model"

export class TabsModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto() {
    return this.page.goto("/tabs")
  }

  private getTabTrigger = (id: string) => {
    return this.page.locator(testid(`${id}-tab`))
  }

  private getTabContent = (id: string) => {
    return this.page.locator(testid(`${id}-tab-panel`))
  }

  clickTab = async (id: string) => {
    await this.getTabTrigger(id).click()
  }

  seeTabContent = async (id: string) => {
    await expect(this.getTabContent(id)).toBeVisible()
  }

  dontSeeTabContent = async (id: string) => {
    await expect(this.getTabContent(id)).not.toBeVisible()
  }

  seeTabIsFocused = async (id: string) => {
    await expect(this.getTabTrigger(id)).toBeFocused()
  }
}

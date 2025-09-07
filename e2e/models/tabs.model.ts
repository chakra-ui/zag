import { expect, type Page } from "@playwright/test"
import { testid } from "../_utils"
import { Model } from "./model"

const shadowHost = "tabs-page"

export class TabsModel extends Model {
  constructor(public page: Page) {
    super(page, shadowHost)
  }

  goto() {
    return this.page.goto("/tabs")
  }

  private getTabTrigger = (id: string) => {
    return this.host.locator(testid(`${id}-tab`))
  }

  private getTabContent = (id: string) => {
    return this.host.locator(testid(`${id}-tab-panel`))
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

  setTabIsFocused = async (id: string) => {
    await expect(this.getTabTrigger(id)).toBeFocused()
  }
}

import { expect, type Page } from "@playwright/test"
import { Model } from "./model"

export class CollapsibleModel extends Model {
  constructor(public page: Page) {
    super(page, "collapsible-page")
  }

  goto(url = "/collapsible") {
    return this.page.goto(url)
  }

  get trigger() {
    return this.host.locator("[data-scope='collapsible'][data-part='trigger']")
  }

  get content() {
    return this.host.locator("[data-scope='collapsible'][data-part='content']")
  }

  async clickTrigger() {
    return this.trigger.click()
  }

  async seeContent() {
    await expect(this.content).toBeVisible()
  }

  async dontSeeContent() {
    await expect(this.content).not.toBeVisible()
  }
}

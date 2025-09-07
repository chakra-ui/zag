import { expect, type Locator, type Page } from "@playwright/test"
import { Model } from "./model"
import { testid } from "../_utils"

export class MenuNestedModel extends Model {
  constructor(
    public page: Page,
    shadowHost = "menu-nested-page",
  ) {
    super(page, shadowHost)
  }

  goto(url = "/menu-nested") {
    return this.page.goto(url)
  }

  getTestId(id: string) {
    return this.host.locator(testid(id))
  }

  get menu1() {
    return {
      trigger: this.getTestId("trigger"),
      menu: this.getTestId("menu"),
      subTrigger: this.getTestId("more-tools"),
    }
  }

  get menu2() {
    return {
      trigger: this.getTestId("more-tools"),
      menu: this.getTestId("more-tools-submenu"),
      subTrigger: this.getTestId("open-nested"),
    }
  }

  get menu3() {
    return {
      trigger: this.getTestId("open-nested"),
      menu: this.getTestId("open-nested-submenu"),
    }
  }

  async expectToBeHighlighted(locator: Locator) {
    await expect(locator).toHaveAttribute("data-highlighted", "")
  }

  async expectItemToBeHighlighted(id: string) {
    return this.expectToBeHighlighted(this.getTestId(id))
  }

  async navigateToSubmenuTrigger() {
    await this.menu1.trigger.click()
    await expect(this.menu1.menu).toBeFocused()
    await this.page.keyboard.press("ArrowDown")
    await this.page.keyboard.press("ArrowDown")
    await this.page.keyboard.press("ArrowDown")
    await this.page.keyboard.press("ArrowDown")
    await this.expectToBeHighlighted(this.menu2.trigger)
    // await this.page.keyboard.type("m")
    // await this.expectItemToBeFocused("more-tools")
  }

  async expectSubmenuToBeFocused() {
    await expect(this.menu2.menu).toBeVisible()
    await expect(this.menu2.menu).toBeFocused()
    await this.expectToBeHighlighted(this.menu2.trigger)
  }

  async expectAllMenusToBeClosed() {
    // close all
    await expect(this.menu1.menu).toBeHidden()
    await expect(this.menu2.menu).toBeHidden()
    await expect(this.menu3.menu).toBeHidden()

    // focus trigger
    await expect(this.menu1.trigger).toBeFocused()
  }
}

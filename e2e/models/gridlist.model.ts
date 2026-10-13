import { expect, type Page } from "@playwright/test"
import { Model } from "./model"

export class GridListModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/gridlist/basic") {
    return this.page.goto(url)
  }

  get label() {
    return this.page.locator("[data-gridlist-label]")
  }

  getItem(value: string) {
    return this.page.locator(`[data-gridlist-item][data-value="${value}"]`)
  }

  clickItem(value: string) {
    return this.getItem(value).click()
  }

  async tabIntoGrid() {
    await this.label.click()
    await this.pressKey("Tab")
  }

  async blurGrid() {
    await this.page.mouse.move(0, 0)
    await this.clickOutside()
  }

  clickItemButton(value: string, name: string) {
    return this.getItem(value).getByRole("button", { name }).click()
  }

  seeItemIsSelected(value: string) {
    return expect(this.getItem(value)).toHaveAttribute("data-selected")
  }

  dontSeeItemIsSelected(value: string) {
    return expect(this.getItem(value)).not.toHaveAttribute("data-selected")
  }

  seeItemIsFocused(value: string) {
    return expect(this.getItem(value)).toBeFocused()
  }

  dontSeeItemIsFocused(value: string) {
    return expect(this.getItem(value)).not.toBeFocused()
  }
}

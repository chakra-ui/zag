import { type Page, expect } from "@playwright/test"
import { Model } from "./model"
import { part } from "../_utils"

const shadowHost = "toggle-group-page"

type Item = "bold" | "italic" | "underline"

export class ToggleGroupModel extends Model {
  constructor(page: Page) {
    super(page, shadowHost)
  }

  private __item(item: Item) {
    return this.host.locator(part("item")).nth(["bold", "italic", "underline"].indexOf(item))
  }

  clickItem(item: Item) {
    return this.__item(item).click()
  }

  private get outsideButton() {
    return this.page.getByRole("button", { name: "Outside" })
  }

  async clickOutsideButton() {
    await this.outsideButton.click()
    await this.outsideButton.focus()
  }

  async seeOutsideButtonIsFocused() {
    return expect(this.outsideButton).toBeFocused()
  }

  seeItemIsFocused(item: Item) {
    return expect(this.__item(item)).toBeFocused()
  }

  seeItemIsNotFocused(item: Item) {
    return expect(this.__item(item)).not.toBeFocused()
  }

  private __notSelected(item: Item) {
    return expect(this.__item(item)).toHaveAttribute("data-state", "off")
  }

  private __selected(item: Item) {
    return expect(this.__item(item)).toHaveAttribute("data-state", "on")
  }

  async seeItemIsSelected(items: Item[]) {
    await Promise.all(items.map((item) => this.__selected(item)))
  }

  async seeItemIsNotSelected(items: Item[]) {
    await Promise.all(items.map((item) => this.__notSelected(item)))
  }
}

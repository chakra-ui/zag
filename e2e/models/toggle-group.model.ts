import { type Page, expect } from "@playwright/test"
import { Model } from "./model"
import { part } from "../_utils"

type Item = "bold" | "italic" | "underline"

export class ToggleGroupModel extends Model {
  constructor(page: Page) {
    super(page)
  }

  getItem(item: Item) {
    return this.page.locator(part("toggle-group", "item")).nth(["bold", "italic", "underline"].indexOf(item))
  }

  get root() {
    return this.page.locator(part("toggle-group", "root"))
  }

  clickItem(item: Item) {
    return this.getItem(item).click()
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
    return expect(this.getItem(item)).toBeFocused()
  }

  seeItemIsNotFocused(item: Item) {
    return expect(this.getItem(item)).not.toBeFocused()
  }

  private __notPressed(item: Item) {
    const itemEl = this.getItem(item)
    return Promise.all([
      expect(itemEl).not.toHaveAttribute("data-pressed"),
      expect(itemEl).toHaveAttribute("aria-pressed", "false"),
    ])
  }

  private __pressed(item: Item) {
    const itemEl = this.getItem(item)
    return Promise.all([
      expect(itemEl).toHaveAttribute("data-pressed", ""),
      expect(itemEl).toHaveAttribute("aria-pressed", "true"),
    ])
  }

  async seeItemIsPressed(items: Item[]) {
    await Promise.all(items.map((item) => this.__pressed(item)))
  }

  async seeItemIsNotPressed(items: Item[]) {
    await Promise.all(items.map((item) => this.__notPressed(item)))
  }
}

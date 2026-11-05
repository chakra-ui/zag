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

  focusItem(item: Item) {
    return this.getItem(item).focus()
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

  seeRootIsNotFocused() {
    return expect(this.root).not.toBeFocused()
  }

  /** Click the gap between two items, which belongs to the root */
  async clickGapBetween(a: Item, b: Item) {
    const first = await this.getItem(a).boundingBox()
    const second = await this.getItem(b).boundingBox()
    if (!first || !second) throw new Error("items are not rendered")
    await this.page.mouse.click((first.x + first.width + second.x) / 2, first.y + first.height / 2)
  }

  /** Squeeze the group so its items overflow and it scrolls horizontally */
  async makeGroupOverflow() {
    await this.root.evaluate((el) => {
      el.style.width = "48px"
      el.style.overflowX = "auto"
    })
  }

  async seeItemIsScrolledIntoView(item: Item) {
    const isInside = await this.getItem(item).evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const root = el.closest("[data-toggle-group-root]")!.getBoundingClientRect()
      return rect.left >= root.left - 1 && rect.right <= root.right + 1
    })
    expect(isInside).toBe(true)
  }

  async seeItemIsPressed(items: Item[]) {
    await Promise.all(items.map((item) => this.__pressed(item)))
  }

  async seeItemIsNotPressed(items: Item[]) {
    await Promise.all(items.map((item) => this.__notPressed(item)))
  }
}

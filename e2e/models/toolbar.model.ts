import { expect, type Locator, type Page } from "@playwright/test"
import { Model } from "./model"
import { a11y, part } from "../_utils"

export class ToolbarModel extends Model {
  constructor(page: Page) {
    super(page)
  }

  goto(url = "/toolbar/basic") {
    return this.page.goto(url)
  }

  get root() {
    return this.page.locator(part("toolbar", "root"))
  }

  item(name: string) {
    return this.page.getByRole("button", { name }).first()
  }

  link(name: string) {
    return this.page.getByRole("link", { name })
  }

  // the root hands focus to an item a frame later; keys pressed before that are lost
  async focusRoot() {
    await this.root.focus()
    await expect(this.root).not.toBeFocused()
  }

  seeItemIsFocused(name: string) {
    return expect(this.item(name)).toBeFocused()
  }

  seeItemIsNotFocused(name: string) {
    return expect(this.item(name)).not.toBeFocused()
  }

  seeLinkIsFocused(name: string) {
    return expect(this.link(name)).toBeFocused()
  }

  seeItemIsDisabled(name: string) {
    return expect(this.item(name)).toBeDisabled()
  }

  seeItemIsEnabled(name: string) {
    return expect(this.item(name)).toBeEnabled()
  }

  seeRootIsNotFocused() {
    return expect(this.root).not.toBeFocused()
  }

  /** Click the toolbar's own padding, away from any item */
  async clickEmptyArea() {
    const box = await this.root.boundingBox()
    if (!box) throw new Error("toolbar is not rendered")
    await this.page.mouse.click(box.x + box.width - 2, box.y + box.height / 2)
  }

  /** Squeeze the toolbar so its items overflow and it scrolls horizontally */
  async makeToolbarOverflow() {
    await this.root.evaluate((el) => {
      el.style.width = "160px"
      el.style.overflowX = "auto"
      el.style.flexWrap = "nowrap"
    })
  }

  seeLinkIsScrolledIntoView(name: string) {
    return this.seeIsInsideToolbar(this.link(name))
  }

  seeItemIsScrolledIntoView(name: string) {
    return this.seeIsInsideToolbar(this.item(name))
  }

  private async seeIsInsideToolbar(locator: Locator) {
    const isInside = await locator.evaluate((el) => {
      const item = el.getBoundingClientRect()
      const root = el.closest("[role=toolbar]")!.getBoundingClientRect()
      return item.left >= root.left && item.right <= root.right
    })
    expect(isInside).toBe(true)
  }

  checkAccessibility() {
    return a11y(this.page, part("toolbar", "root"))
  }
}

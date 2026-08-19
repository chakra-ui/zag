import { expect, type Page } from "@playwright/test"
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

  focusRoot() {
    return this.root.focus()
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

  checkAccessibility() {
    return a11y(this.page, part("toolbar", "root"))
  }
}

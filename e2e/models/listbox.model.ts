import { expect, type Page } from "@playwright/test"
import { a11y, isInViewport } from "../_utils"
import { Model } from "./model"

export class ListboxModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/listbox") {
    return this.page.goto(url)
  }

  get label() {
    return this.page.locator("[data-scope=listbox][data-part=label]")
  }

  get input() {
    return this.page.locator("[data-scope=listbox][data-part=input]")
  }

  getItem = (text: string) => {
    return this.page.locator(`[data-scope=listbox][data-part=item]`, { hasText: text })
  }

  get content() {
    return this.page.locator("[data-scope=listbox][data-part=content]")
  }

  async focusContent() {
    await this.content.focus()
    await expect(this.content).toBeFocused()
  }

  typeSequentially(value: string) {
    return this.input.pressSequentially(value)
  }

  clickItem(value: string) {
    return this.getItem(value).click()
  }

  seeItemIsHighlighted(value: string) {
    return expect(this.getItem(value)).toHaveAttribute("data-highlighted", "")
  }

  seeNoItemIsHighlighted() {
    return expect(this.content.locator(`[data-highlighted]`).all()).toHaveLength(0)
  }

  seeItemIsSelected(value: string) {
    return expect(this.getItem(value)).toHaveAttribute("data-selected", "")
  }

  seeNoItemIsSelected() {
    return expect(this.content.locator(`[data-selected]`).all()).toHaveLength(0)
  }

  seeItemInViewport(value: string) {
    return isInViewport(this.content, this.getItem(value))
  }
}

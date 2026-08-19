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

  goto(url = "/listbox/basic") {
    return this.page.goto(url)
  }

  get label() {
    return this.page.locator("[data-listbox-label]")
  }

  get input() {
    return this.page.locator("[data-listbox-input]")
  }

  getItem = (text: string) => {
    return this.page.locator(`[data-listbox-item]`, { hasText: text })
  }

  get content() {
    return this.page.locator("[data-listbox-content]")
  }

  get list() {
    return this.page.locator("[data-listbox-list]")
  }

  async tabToContent() {
    await this.page.click("main.listbox", { position: { x: 300, y: 30 }, force: true })
    await this.page.keyboard.press("Tab")
    await expect(this.list).toBeFocused()
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

  seeItemInViewport = async (text: string) => {
    const item = this.getItem(text)
    expect(await isInViewport(this.content, item)).toBe(true)
  }
}

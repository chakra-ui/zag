import { expect, type Page } from "@playwright/test"
import { Model } from "./model"

export class TagsInputModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto() {
    return this.page.goto("/tags-input")
  }

  private get input() {
    return this.page.locator("[data-testid=input]")
  }

  getTag(value: string) {
    return this.page.locator(`[data-testid=${value.toLowerCase()}-tag]`)
  }

  getTagClose(value: string) {
    return this.page.locator(`[data-testid=${value.toLowerCase()}-close-button]`)
  }

  getTagInput(value: string) {
    return this.page.locator(`[data-testid=${value.toLowerCase()}-input]`)
  }

  async paste(value: string) {
    await this.input.focus()
    await this.page.evaluate((value) => navigator.clipboard.writeText(value), value)
    await this.page.keyboard.press("ControlOrMeta+V")
  }

  async addTag(value: string) {
    await this.input.pressSequentially(value)
    await this.page.keyboard.press("Enter")
  }

  async editTag(value: string) {
    await this.type(value)
    await this.page.keyboard.press("Enter")
  }

  clickTag(value: string) {
    return this.getTag(value).click()
  }

  focusInput() {
    return this.input.focus()
  }

  deleteLastTag() {
    return this.pressKey("Backspace", 2)
  }

  doubleClickTag(value: string) {
    return this.getTag(value).dblclick()
  }

  clickOutside() {
    return this.page.click("body", { force: true })
  }

  clickTagClose(value: string) {
    return this.getTagClose(value).click({ force: true })
  }

  async seeTagIsHighlighted(value: string) {
    await expect(this.getTag(value)).toHaveAttribute("data-highlighted", "")
  }

  async seeTag(value: string) {
    await expect(this.getTag(value)).toBeVisible()
  }

  async dontSeeTag(value: string) {
    await expect(this.getTag(value)).toBeHidden()
  }

  async seeInputIsFocused() {
    await expect(this.input).toBeFocused()
  }

  async seeInputHasValue(value: string) {
    await expect(this.input).toHaveValue(value)
  }

  async seeTagInputIsFocused(value: string) {
    await expect(this.getTagInput(value)).toBeFocused()
  }

  async dontSeeTagInput(value: string) {
    await expect(this.getTagInput(value)).toBeHidden()
  }

  async seeTagInputHasValue(value: string) {
    await expect(this.getTagInput(value)).toHaveValue(value)
  }

  async expectNoTagToBeHighlighted() {
    return expect(await this.page.locator("[data-part=item][data-selected]").count()).toBe(0)
  }
}

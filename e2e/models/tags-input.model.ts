import { expect, type Page } from "@playwright/test"
import { paste } from "../_utils"
import { Model } from "./model"

export class TagsInputModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto() {
    return this.page.goto("/tags-input")
  }

  get input() {
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
    return this.page.$eval("[data-testid=input]", paste, value)
  }

  async addTag(value: string) {
    await this.input.pressSequentially(value)
    await this.page.keyboard.press("Enter")
  }

  async editTag(value: string) {
    await this.type(value)
    await this.page.keyboard.press("Enter")
  }

  deleteLastTag() {
    return this.pressBackspace(2)
  }

  dblClick(value: string) {
    return this.getTag(value).dblclick()
  }

  clickOutside() {
    return this.page.click("body", { force: true })
  }

  clickTagClose(value: string) {
    return this.getTagClose(value).click({ force: true })
  }

  async expectTagToBeHighlighted(value: string) {
    const el = this.getTag(value)
    await expect(el).toHaveAttribute("data-highlighted", "")
  }

  async expectTagToBeVisible(value: string) {
    const el = this.getTag(value)
    await expect(el).toBeVisible()
  }

  async expectTagToBeRemoved(value: string) {
    const el = this.getTag(value)
    await expect(el).toBeHidden()
  }

  async expectInputToBeFocused() {
    await expect(this.input).toBeFocused()
  }

  async expectInputToHaveValue(value: string) {
    await expect(this.input).toHaveValue(value)
  }

  async expectTagInputToBeFocused(value: string) {
    await expect(this.getTagInput(value)).toBeFocused()
  }

  async expectTagInputToBeHidden(value: string) {
    await expect(this.getTagInput(value)).toBeHidden()
  }

  async expectTagInputToHaveValue(value: string) {
    await expect(this.getTagInput(value)).toHaveValue(value)
  }

  async expectInputToBeEmpty() {
    await expect(this.input).toBeEmpty()
  }

  async expectNoTagToBeHighlighted() {
    return expect(await this.page.locator("[data-part=item][data-selected]").count()).toBe(0)
  }
}

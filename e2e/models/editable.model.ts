import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class EditableModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto() {
    return this.page.goto("/editable")
  }

  get preview() {
    return this.page.locator("[data-testid=preview]")
  }

  get input() {
    return this.page.locator("[data-testid=input]")
  }

  get submitTrigger() {
    return this.page.locator("[data-testid=save-button]")
  }

  get editTrigger() {
    return this.page.locator("[data-testid=edit-button]")
  }

  get cancelTrigger() {
    return this.page.locator("[data-testid=cancel-button]")
  }

  async focusPreview() {
    await this.preview.focus()
    await this.page.waitForSelector("input:focus")
  }

  typeSequentially(value: string) {
    return this.input.pressSequentially(value)
  }

  clickEdit() {
    return this.editTrigger.click()
  }

  clickSubmit() {
    return this.submitTrigger.click()
  }

  clickCancel() {
    return this.cancelTrigger.click()
  }

  dblClickPreview() {
    return this.preview.dblclick()
  }

  seeInput() {
    return expect(this.input).toBeVisible()
  }

  dontSeeInput() {
    return expect(this.input).not.toBeVisible()
  }

  seeInputIsFocused() {
    return expect(this.input).toBeFocused()
  }

  seeInputHasValue(value: string) {
    return expect(this.input).toHaveValue(value)
  }

  seePreviewHasText(text: string) {
    return expect(this.preview).toHaveText(text)
  }
}

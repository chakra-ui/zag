import { expect, type Page } from "@playwright/test"
import { a11y, getCaret } from "../_utils"
import { Model } from "./model"

export class PasswordInputModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/password-input/basic") {
    return this.page.goto(url)
  }

  get input() {
    return this.page.locator(`[data-scope=password-input][data-part=input]`)
  }

  get visibilityTrigger() {
    return this.page.locator("[data-scope=password-input][data-part=visibility-trigger]")
  }

  clickVisibilityTrigger = async () => {
    await this.visibilityTrigger.click()
  }

  seeVisibilityTriggerIsFocused = async () => {
    await expect(this.visibilityTrigger).toBeFocused()
  }

  seeInputIsFocused = async () => {
    await expect(this.input).toBeFocused()
  }

  seeVisibilityTriggerLabel = async (label: string) => {
    await expect(this.visibilityTrigger).toHaveAttribute("aria-label", label)
    await expect(this.visibilityTrigger).not.toHaveAttribute("aria-expanded")
  }

  canSeePassword = async () => {
    await expect(this.input).toHaveAttribute("type", "text")
  }

  cantSeePassword = async () => {
    await expect(this.input).toHaveAttribute("type", "password")
  }

  caretIsAt = async (start: number, end = start) => {
    const caret = await getCaret(this.input)
    expect(caret.start).toBe(start)
    expect(caret.end).toBe(end)
  }
}

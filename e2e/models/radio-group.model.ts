import { expect, type Page } from "@playwright/test"
import { Model } from "./model"

export class RadioGroupModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/radio-group") {
    return this.page.goto(url)
  }

  get root() {
    return this.page.locator("[data-scope='radio-group'][data-part='root']")
  }

  get label() {
    return this.page.locator("[data-scope='radio-group'][data-part='label']")
  }

  getRadio(value: string) {
    return {
      radio: this.page.getByTestId(`radio-${value}`),
      label: this.page.getByTestId(`label-${value}`),
      input: this.page.getByTestId(`input-${value}`),
      control: this.page.getByTestId(`control-${value}`),
    }
  }

  async clickRadio(value: string) {
    return this.getRadio(value).radio.click()
  }

  async clickMain() {
    return this.page.click("main")
  }

  async tabToFirstRadio() {
    await this.clickMain()
    await this.pressKey("Tab")
  }

  async seeRadioIsChecked(value: string) {
    const radio = this.getRadio(value)
    await expect(radio.radio).toHaveAttribute("data-state", "checked")
    await expect(radio.label).toHaveAttribute("data-state", "checked")
    await expect(radio.control).toHaveAttribute("data-state", "checked")
  }

  async seeRadioIsFocused(value: string) {
    const radio = this.getRadio(value)
    await expect(radio.input).toBeFocused()
    await expect(radio.control).toHaveAttribute("data-focus", "")
  }

  async seeRadioIsFocusVisible(value: string) {
    const radio = this.getRadio(value)
    await expect(radio.control).toHaveAttribute("data-focus-visible", "")
  }

  async seeRadioIsNotFocusVisible(value: string) {
    const radio = this.getRadio(value)
    await expect(radio.control).toHaveAttribute("data-focus", "")
    await expect(radio.control).not.toHaveAttribute("data-focus-visible", "")
  }

  async seeRadioIsDisabled(value: string) {
    const radio = this.getRadio(value)
    await expect(radio.control).toHaveAttribute("data-disabled", "")
    await expect(radio.input).toBeDisabled()
  }

  async seeRadioIsNotFocused(value: string) {
    const radio = this.getRadio(value)
    await expect(radio.input).not.toBeFocused()
  }

  async seeRadioIsNotFocusable() {
    await this.tabToFirstRadio()
    await expect(this.getRadio("apple").input).not.toBeFocused()
  }

  async seeRadioIsFocusable() {
    await this.tabToFirstRadio()
    await expect(this.getRadio("apple").input).toBeFocused()
  }

  async seeRootHasLabelledBy() {
    const labelId = await this.label.getAttribute("id")
    expect(labelId).not.toBeNull()

    if (!labelId) return
    await expect(this.root).toHaveAttribute("aria-labelledby", labelId)
  }
}

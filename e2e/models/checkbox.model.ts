import { expect, type Page } from "@playwright/test"
import { part, testid } from "../_utils"
import { Model } from "./model"

const shadowHost = "checkbox-page"

export class CheckboxModel extends Model {
  constructor(public page: Page) {
    super(page, shadowHost)
  }

  goto() {
    return this.page.goto("/checkbox")
  }

  get root() {
    return this.host.locator(part("root"))
  }

  get label() {
    return this.host.locator(part("label"))
  }

  get control() {
    return this.host.locator(part("control"))
  }

  get input() {
    return this.host.locator(testid("hidden-input"))
  }

  get resetButton() {
    return this.host.getByRole("button", { name: "Reset Form" })
  }

  async expectToBeChecked() {
    await expect(this.root).toHaveAttribute("data-state", "checked")
    await expect(this.label).toHaveAttribute("data-state", "checked")
    await expect(this.control).toHaveAttribute("data-state", "checked")
  }

  async expectToBeDisabled() {
    await expect(this.root).toHaveAttribute("data-disabled", "")
    await expect(this.control).toHaveAttribute("data-disabled", "")
    await expect(this.input).toBeDisabled()
  }
}

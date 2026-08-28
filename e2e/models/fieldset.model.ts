import { expect, type Page } from "@playwright/test"
import { part } from "../_utils"
import { Model } from "./model"

const root = part("fieldset", "root")
const legend = part("fieldset", "legend")
const errorText = part("fieldset", "error-text")
const fieldInput = part("field", "control")

export class FieldsetModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto() {
    return this.page.goto(`/fieldset/basic`)
  }

  getRoot() {
    return this.page.locator(root)
  }

  getLegend() {
    return this.page.locator(legend)
  }

  getErrorText() {
    return this.page.locator(errorText)
  }

  getFieldInput() {
    return this.page.locator(fieldInput)
  }

  toggleOption(name: "Disabled" | "Invalid") {
    return this.page.getByRole("checkbox", { name }).click()
  }

  async seeLegendLinked() {
    const legendId = await this.getLegend().getAttribute("id")
    await expect(this.getRoot()).toHaveAttribute("aria-labelledby", legendId!)
  }

  // Playwright's toBeDisabled() does not consider <fieldset>, so assert the attribute
  async seeDisabled(disabled: boolean) {
    if (disabled) {
      await expect(this.getRoot()).toHaveAttribute("disabled", "")
      await expect(this.getRoot()).toHaveAttribute("data-disabled", "")
    } else {
      await expect(this.getRoot()).not.toHaveAttribute("disabled")
      await expect(this.getRoot()).not.toHaveAttribute("data-disabled")
    }
  }

  async seeFieldInheritsDisabled(disabled: boolean) {
    if (disabled) {
      await expect(this.getFieldInput()).toBeDisabled()
      await expect(this.getFieldInput()).toHaveAttribute("data-disabled", "")
    } else {
      await expect(this.getFieldInput()).toBeEnabled()
      await expect(this.getFieldInput()).not.toHaveAttribute("data-disabled")
    }
  }

  async seeError() {
    await expect(this.getErrorText()).toBeVisible()
  }

  async dontSeeError() {
    await expect(this.getErrorText()).toBeHidden()
  }

  /** The error id joins the fieldset's `aria-describedby` only while invalid. */
  async seeErrorDescribed(described: boolean) {
    const errorId = await this.getErrorText().getAttribute("id")
    const describedBy = (await this.getRoot().getAttribute("aria-describedby")) ?? ""
    expect(describedBy.split(" ").includes(errorId!)).toBe(described)
  }

  async seeFieldNotInvalid() {
    await expect(this.getFieldInput()).not.toHaveAttribute("data-invalid")
  }
}

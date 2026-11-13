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

  goto(example: "basic" | "groups" | "nested" = "basic") {
    return this.page.goto(`/fieldset/${example}`)
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

  toggleOption(name: string) {
    return this.page.getByRole("checkbox", { name }).click()
  }

  getFieldset(legend: string) {
    return this.page.getByRole("group", { name: legend, exact: true })
  }

  clickButton(name: string) {
    return this.page.getByRole("button", { name }).click()
  }

  clickOption(label: string) {
    return this.page.getByLabel(label, { exact: true }).click()
  }

  async seeFieldsetInvalid(legend: string, invalid: boolean) {
    const fieldset = this.getFieldset(legend)
    if (invalid) await expect(fieldset).toHaveAttribute("data-invalid", "")
    else await expect(fieldset).not.toHaveAttribute("data-invalid")
    await expect(fieldset).not.toHaveAttribute("aria-invalid")
  }

  /** Every control in the fieldset is described by its error text only while invalid. */
  async seeOptionsDescribedByError(legend: string, described: boolean) {
    const fieldset = this.getFieldset(legend)
    const errorId = await fieldset.locator(errorText).first().getAttribute("id")
    const controls = fieldset.locator("input")
    for (let i = 0; i < (await controls.count()); i++) {
      const describedBy = (await controls.nth(i).getAttribute("aria-describedby")) ?? ""
      expect(describedBy.split(" ").includes(errorId!)).toBe(described)
    }
  }

  async seeFocusedOption(label: string) {
    await expect(this.page.getByLabel(label, { exact: true })).toBeFocused()
  }

  async seeInputDisabled(name: string, disabled: boolean) {
    const input = this.page.locator(`input[name="${name}"]`).first()
    if (disabled) await expect(input).toHaveAttribute("data-disabled", "")
    else await expect(input).not.toHaveAttribute("data-disabled")
  }

  async seeCheckboxDisabled(disabled: boolean) {
    const root = this.page.locator(part("checkbox", "root"))
    if (disabled) await expect(root).toHaveAttribute("data-disabled", "")
    else await expect(root).not.toHaveAttribute("data-disabled")
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

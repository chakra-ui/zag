import { expect, type Page } from "@playwright/test"
import { part } from "../_utils"
import { Model } from "./model"

type Route =
  | "basic"
  | "controlled"
  | "validation"
  | "debounced-validation"
  | "custom-messages"
  | "select"
  | "item"
  | "textarea-autoresize"

type DataAttr =
  | "data-touched"
  | "data-dirty"
  | "data-filled"
  | "data-focus"
  | "data-invalid"
  | "data-valid"
  | "data-disabled"
  | "data-required"
  | "data-readonly"

const control = part("field", "control")
const errorText = part("field", "error-text")
const helperText = part("field", "helper-text")
const indicator = part("field", "indicator")

export class FieldModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(route: Route = "basic") {
    return this.page.goto(`/field/${route}`)
  }

  getControl() {
    return this.page.locator(control)
  }

  getAmount() {
    return this.testId("amount")
  }

  getCurrency() {
    return this.testId("currency")
  }

  selectOption(value: string) {
    return this.page.locator(`select${control}`).selectOption(value)
  }

  getErrorText() {
    return this.page.locator(`${errorText}:not([hidden])`)
  }

  getHelperText() {
    return this.page.locator(helperText)
  }

  getIndicator(type: "required" | "invalid" | "valid" | "validating") {
    return this.page.locator(`${indicator}[data-type="${type}"]`)
  }

  async seeIndicator(type: "required" | "invalid" | "valid" | "validating") {
    await expect(this.getIndicator(type)).toBeVisible()
  }

  async dontSeeIndicator(type: "required" | "invalid" | "valid" | "validating") {
    await expect(this.getIndicator(type)).toBeHidden()
  }

  async fillControl(value: string) {
    await this.getControl().fill(value)
  }

  async blurControl() {
    await this.getControl().blur()
  }

  async focusControl() {
    await this.getControl().focus()
  }

  submit() {
    return this.clickButton("Submit")
  }

  reset() {
    return this.clickButton("Reset")
  }

  setMode(mode: "onSubmit" | "onBlur" | "onChange") {
    return this.page.locator(".options select").selectOption(mode)
  }

  toggleOption(name: "Disabled" | "Invalid" | "Required" | "Async validation" | "Dirty" | "Touched") {
    return this.page.getByRole("checkbox", { name }).click()
  }

  async seeError(text?: string | RegExp) {
    await expect(this.getErrorText()).toBeVisible()
    if (text != null) await expect(this.getErrorText()).toHaveText(text)
  }

  async dontSeeError() {
    await expect(this.page.locator(`${errorText}:not([hidden])`)).toHaveCount(0)
  }

  async seeControlAttr(attr: DataAttr) {
    await expect(this.getControl()).toHaveAttribute(attr, "")
  }

  async dontSeeControlAttr(attr: DataAttr) {
    await expect(this.getControl()).not.toHaveAttribute(attr)
  }

  async seeAriaInvalid() {
    await expect(this.getControl()).toHaveAttribute("aria-invalid", "true")
  }

  async dontSeeAriaInvalid() {
    await expect(this.getControl()).not.toHaveAttribute("aria-invalid")
  }

  /** Visible error ids join `aria-describedby`; hidden ones must not. */
  async seeErrorDescribed(described: boolean) {
    const describedBy = (await this.getControl().getAttribute("aria-describedby")) ?? ""
    const describedIds = describedBy.split(" ").filter(Boolean)
    const allErrorIds = await this.page.locator(errorText).evaluateAll((els) => els.map((el) => el.id))
    const visibleIds = await this.getErrorText().evaluateAll((els) => els.map((el) => el.id))
    if (described) {
      expect(visibleIds.length).toBeGreaterThan(0)
      expect(visibleIds.every((id) => describedIds.includes(id))).toBe(true)
    } else {
      expect(describedIds.some((id) => allErrorIds.includes(id))).toBe(false)
    }
  }

  async seeLabelPointsToControl() {
    const labelFor = await this.page.locator(part("field", "label")).getAttribute("for")
    const controlId = await this.getControl().getAttribute("id")
    expect(labelFor).toBe(controlId)
  }

  async seeLabelPointsToAmount() {
    const labelFor = await this.page.locator(part("field", "label")).getAttribute("for")
    const amountId = await this.getAmount().getAttribute("id")
    const currencyId = await this.getCurrency().getAttribute("id")
    expect(labelFor).toBe(amountId)
    expect(currencyId).not.toBe(amountId)
  }

  async fillAmount(value: string) {
    await this.getAmount().fill(value)
  }

  selectCurrency(value: string) {
    return this.getCurrency().selectOption(value)
  }

  async seeAmountAttr(attr: DataAttr) {
    await expect(this.getAmount()).toHaveAttribute(attr, "")
  }

  async dontSeeAmountAttr(attr: DataAttr) {
    await expect(this.getAmount()).not.toHaveAttribute(attr)
  }

  async seeBothControlsAriaInvalid() {
    await expect(this.getAmount()).toHaveAttribute("aria-invalid", "true")
    await expect(this.getCurrency()).toHaveAttribute("aria-invalid", "true")
  }

  async seeSubmitted() {
    await expect(this.testId("submitted")).toBeVisible()
  }

  async dontSeeSubmitted() {
    await expect(this.testId("submitted")).toBeHidden()
  }

  async seeValidating() {
    await expect(this.testId("validating")).toBeVisible()
  }

  async seeValidateCalls(count: number) {
    await expect(this.testId("validate-calls")).toHaveText(`Checks: ${count}`)
  }

  async seePristine() {
    await this.dontSeeControlAttr("data-touched")
    await this.dontSeeControlAttr("data-dirty")
    await this.dontSeeControlAttr("data-filled")
    await this.dontSeeControlAttr("data-invalid")
    await this.dontSeeControlAttr("data-valid")
    await this.dontSeeError()
  }
}

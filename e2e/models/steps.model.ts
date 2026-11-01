import { expect, type Page } from "@playwright/test"
import { a11y, part } from "../_utils"
import { Model } from "./model"

export class StepsModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  async goto(url = "/steps/basic") {
    // SSR frameworks hydrate after `load`; clicks before that hit markup with no handlers
    await this.page.goto(url, { waitUntil: "networkidle" })
  }

  checkAccessibility(selector?: string): Promise<void> {
    return a11y(this.page, selector)
  }

  private locate(name: string, value?: string) {
    const selector = part("steps", name)
    return this.page.locator(value ? `${selector}[data-value="${value}"]` : selector)
  }

  getTrigger(value: string) {
    return this.locate("trigger", value)
  }

  getContent(value: string) {
    return this.locate("content", value)
  }

  getCompletedContent() {
    return this.page.locator(`${part("steps", "content")}[data-value="__complete__"]`)
  }

  get nextTrigger() {
    return this.page.locator(part("steps", "next-trigger"))
  }

  get previousTrigger() {
    return this.page.locator(part("steps", "prev-trigger"))
  }

  get skipTrigger() {
    return this.page.locator(part("steps", "skip-trigger"))
  }

  clickNext() {
    return this.nextTrigger.click()
  }

  clickPrev() {
    return this.previousTrigger.click()
  }

  clickSkip() {
    return this.skipTrigger.click()
  }

  clickTrigger(value: string) {
    return this.getTrigger(value).click()
  }

  focusTrigger(value: string) {
    return this.getTrigger(value).focus()
  }

  async seeCurrentStep(value: string) {
    await expect(this.getTrigger(value)).toHaveAttribute("data-current", "")
  }

  async seeAriaCurrentStep(value: string) {
    await expect(this.getTrigger(value)).toHaveAttribute("aria-current", "step")
    await expect(this.locate("item", value)).not.toHaveAttribute("aria-current")
  }

  async dontSeeAriaCurrentStep(value: string) {
    await expect(this.getTrigger(value)).not.toHaveAttribute("aria-current")
  }

  async seeStepState(value: string, state: "complete" | "skipped" | "incomplete") {
    await expect(this.getTrigger(value)).toHaveAttribute(`data-${state}`, "")
  }

  async dontSeeStepState(value: string, state: "complete" | "skipped" | "incomplete") {
    await expect(this.getTrigger(value)).not.toHaveAttribute(`data-${state}`)
  }

  async seeTriggerIsFocused(value: string) {
    await expect(this.getTrigger(value)).toBeFocused()
  }

  async seeTriggerIsDisabled(value: string) {
    await expect(this.getTrigger(value)).toBeDisabled()
  }

  async seeTriggerIsEnabled(value: string) {
    await expect(this.getTrigger(value)).toBeEnabled()
  }

  async seeCompletedContent() {
    await expect(this.getCompletedContent()).toBeVisible()
  }

  async dontSeeCompletedContent() {
    await expect(this.getCompletedContent()).not.toBeVisible()
  }

  async seeSkipTrigger() {
    await expect(this.skipTrigger).toBeVisible()
  }

  async dontSeeSkipTrigger() {
    await expect(this.skipTrigger).toBeHidden()
  }
}

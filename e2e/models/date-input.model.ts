import { type Page, expect } from "@playwright/test"
import { a11y, part } from "../_utils"
import { Model } from "./model"

export class DateInputModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/date-input") {
    return this.page.goto(url)
  }

  checkAccessibility(selector?: string, disableRules?: string[]) {
    return a11y(this.page, selector, disableRules)
  }

  private scope(p: string) {
    return `[data-scope=date-input]${part(p)}`
  }

  get root() {
    return this.page.locator(this.scope("root"))
  }

  get label() {
    return this.page.locator(this.scope("label"))
  }

  get control() {
    return this.page.locator(this.scope("control"))
  }

  getSegmentGroup(index = 0) {
    return this.page.locator(`${this.scope("segment-group")}`)
  }

  getEditableSegments(index = 0) {
    return this.page.locator(`${this.scope("segment")}[data-editable]`)
  }

  getSegmentByType(type: string) {
    return this.page.locator(`${this.scope("segment")}[data-type=${type}]`)
  }

  get output() {
    return this.page.locator(".date-output")
  }

  // --- Actions ---

  async focusFirstSegment() {
    const first = this.getEditableSegments().first()
    await first.click()
  }

  async focusSegment(type: string) {
    await this.getSegmentByType(type).click()
  }

  async clickOutsideToBlur() {
    await this.page.locator("main").click({ position: { x: 10, y: 10 } })
  }

  // --- Assertions ---

  seeSegmentFocused(type: string) {
    return expect(this.getSegmentByType(type)).toBeFocused()
  }

  seeSegmentText(type: string, text: string) {
    return expect(this.getSegmentByType(type)).toHaveText(text)
  }

  seeSegmentIsPlaceholder(type: string) {
    return expect(this.getSegmentByType(type)).toHaveAttribute("data-placeholder", "")
  }

  seeSegmentIsNotPlaceholder(type: string) {
    return expect(this.getSegmentByType(type)).not.toHaveAttribute("data-placeholder")
  }

  seeSelectedValue(value: string) {
    return expect(this.output).toContainText(`Selected: ${value || "-"}`)
  }

  seePlaceholderValue(value: string) {
    return expect(this.output).toContainText(`Placeholder: ${value}`)
  }

  seeControlFocused() {
    return expect(this.control).toHaveAttribute("data-focus", "")
  }

  seeControlNotFocused() {
    return expect(this.control).not.toHaveAttribute("data-focus")
  }
}

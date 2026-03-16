import { type Page, expect } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class DateInputModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/date-input/basic") {
    return this.page.goto(url)
  }

  checkAccessibility(selector?: string, disableRules?: string[]) {
    return a11y(this.page, selector, disableRules)
  }

  get root() {
    return this.page.locator(`[data-scope=date-input][data-part=root]`)
  }

  get label() {
    return this.page.locator(`[data-scope=date-input][data-part=label]`)
  }

  get control() {
    return this.page.locator(`[data-scope=date-input][data-part=control]`)
  }

  getEditableSegments() {
    return this.page.locator(`[data-scope=date-input][data-part=segment][data-editable]`)
  }

  getSegment(type: string) {
    return this.page.locator(`[data-scope=date-input][data-part=segment][data-type=${type}]`)
  }

  get output() {
    return this.page.locator(".date-output")
  }

  getSegmentNth(type: string, index = 0) {
    return this.getSegment(type).nth(index)
  }

  // --- Actions ---

  async focusFirstSegment() {
    const first = this.getEditableSegments().first()
    await first.click()
  }

  async focusSegment(type: string) {
    await this.getSegment(type).click()
  }

  async clickOutsideToBlur() {
    await this.page.locator("main").click({ position: { x: 10, y: 10 } })
  }

  // --- Assertions ---

  seeSegmentFocused(type: string) {
    return expect(this.getSegment(type)).toBeFocused()
  }

  seeSegmentInGroupFocused(type: string, groupIndex?: number) {
    return expect(this.getSegmentNth(type, groupIndex)).toBeFocused()
  }

  seeSegmentText(type: string, text: string) {
    return expect(this.getSegment(type)).toHaveText(text)
  }

  seeSegmentIsPlaceholder(type: string) {
    return expect(this.getSegment(type)).toHaveAttribute("data-placeholder-shown", "")
  }

  seeSegmentIsNotPlaceholder(type: string) {
    return expect(this.getSegment(type)).not.toHaveAttribute("data-placeholder-shown")
  }

  seeSegmentInGroupIsPlaceholder(type: string, index?: number) {
    return expect(this.getSegmentNth(type, index)).toHaveAttribute("data-placeholder-shown", "")
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

  seeEditingValue(value: string) {
    return expect(this.output).toContainText(`Editing: ${value}`)
  }

  seeNoEditingValue() {
    return expect(this.output).toContainText("Editing: -")
  }
}

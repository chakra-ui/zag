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

  getSegmentGroup(index?: number) {
    const locator = this.page.locator(`[data-scope=date-input][data-part=segment-group]`)
    return index != null ? locator.nth(index) : locator
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

  getSegmentInGroup(type: string, groupIndex: number) {
    return this.getSegmentGroup(groupIndex).locator(`[data-scope=date-input][data-part=segment][data-type=${type}]`)
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

  async paste(text: string) {
    await this.page.evaluate(async (text) => {
      const dt = new DataTransfer()
      dt.setData("text/plain", text)
      const event = new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true })
      document.activeElement?.dispatchEvent(event)
    }, text)
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

  seeSegmentHasCount(type: string, count: number) {
    return expect(this.getSegment(type)).toHaveCount(count)
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

  seeSegmentGroupFocused(groupIndex: number) {
    return expect(this.getSegmentGroup(groupIndex)).toHaveAttribute("data-focus", "")
  }

  seeSegmentGroupNotFocused(groupIndex: number) {
    return expect(this.getSegmentGroup(groupIndex)).not.toHaveAttribute("data-focus")
  }

  seeEditingValue(value: string) {
    return expect(this.output).toContainText(`Editing: ${value}`)
  }

  seeNoEditingValue() {
    return expect(this.output).toContainText("Editing: -")
  }
}

import { expect, type Page } from "@playwright/test"
import { a11y, testid } from "../_utils"
import { Model } from "./model"

export class PopoverModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/popover/basic") {
    return this.page.goto(url)
  }

  get trigger() {
    return this.page.locator("[data-popover-trigger]")
  }

  get content() {
    return this.page.locator("[data-popover-content]")
  }

  /** The trigger with this value, or the first one */
  getTrigger(value?: string) {
    if (value == null) return this.trigger.first()
    return this.page.locator(`[data-popover-trigger][data-value="${value}"]`)
  }

  /** The content for this trigger value, or the only one */
  getContent(value?: string) {
    if (value == null) return this.content
    return this.page.locator(`[data-popover-content][data-value="${value}"]`)
  }

  get positioner() {
    return this.page.locator("[data-popover-positioner]")
  }

  get viewport() {
    return this.page.locator("[data-popover-viewport]")
  }

  get arrow() {
    return this.page.locator("[data-popover-arrow]")
  }

  seePositionerIsTransitioning() {
    return this.seeDataAttr(this.positioner, "transitioning")
  }

  seePositionerIsNotTransitioning() {
    return this.dontSeeDataAttr(this.positioner, "transitioning")
  }

  get closeTrigger() {
    return this.page.locator("[data-popover-close-trigger]")
  }

  get buttonBefore() {
    return this.page.locator(testid("button-before"))
  }

  get buttonAfter() {
    return this.page.locator(testid("button-after"))
  }

  get link() {
    return this.page.locator(testid("focusable-link"))
  }

  get plainText() {
    return this.page.locator(testid("plain-text"))
  }

  clickClose() {
    return this.closeTrigger.click()
  }

  clickTrigger() {
    return this.trigger.click()
  }

  focusTrigger() {
    return this.trigger.focus()
  }

  seeContent() {
    return expect(this.content).toBeVisible()
  }

  dontSeeContent() {
    return expect(this.content).toBeHidden()
  }

  clickButtonBefore() {
    return this.buttonBefore.click()
  }

  seeLinkIsFocused() {
    return expect(this.link).toBeFocused()
  }

  /** Without a value, the only trigger */
  seeTriggerIsFocused(value?: string) {
    return expect(value == null ? this.trigger : this.getTrigger(value)).toBeFocused()
  }

  /** Without a value, the only content */
  seeContentIsFocused(value?: string) {
    return expect(this.getContent(value)).toBeFocused()
  }

  async seeContentIsLabelled() {
    const titleId = await this.page.locator(testid("popover-title")).getAttribute("id")
    const descriptionId = await this.page.locator(testid("popover-description")).getAttribute("id")
    await expect(this.content).toHaveAttribute("aria-labelledby", titleId!)
    await expect(this.content).toHaveAttribute("aria-describedby", descriptionId!)
  }

  seeContentIsNotFocused() {
    return expect(this.content).not.toBeFocused()
  }

  seeButtonAfterIsFocused() {
    return expect(this.buttonAfter).toBeFocused()
  }

  seeButtonBeforeIsFocused() {
    return expect(this.buttonBefore).toBeFocused()
  }
}

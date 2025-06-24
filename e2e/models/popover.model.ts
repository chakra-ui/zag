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

  goto() {
    return this.page.goto("/popover")
  }

  get trigger() {
    return this.page.locator("[data-scope=popover][data-part=trigger]")
  }

  get content() {
    return this.page.locator("[data-scope=popover][data-part=content]")
  }

  get closeTrigger() {
    return this.page.locator("[data-scope=popover][data-part=close-trigger]")
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

  seeTriggerIsFocused() {
    return expect(this.trigger).toBeFocused()
  }

  seeContentIsFocused() {
    return expect(this.content).toBeFocused()
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

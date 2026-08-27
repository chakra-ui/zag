import { expect, type Page } from "@playwright/test"
import { Model } from "./model"

export class ScrollLockModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  gotoHtmlScroller() {
    return this.page.goto("/scroll-lock/html-scroller")
  }

  clickTrigger() {
    return this.page.getByTestId("dialog-trigger").click()
  }

  clickClose() {
    return this.page.getByTestId("dialog-close").click()
  }

  async seeZagLockEventually() {
    await expect(this.page.locator("body")).toHaveAttribute("data-scroll-lock", "")
  }

  async seeNoZagLockEventually() {
    await expect(this.page.locator("body")).not.toHaveAttribute("data-scroll-lock", "")
  }

  isHtmlLocked() {
    return this.page.evaluate(() => document.documentElement.style.overflow === "hidden")
  }

  isBodyLocked() {
    return this.page.evaluate(() => document.body.style.overflow === "hidden")
  }
}

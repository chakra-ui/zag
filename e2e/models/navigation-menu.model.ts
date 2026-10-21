import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class NavigationMenuModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(id?: "viewport") {
    return this.page.goto(`/navigation-menu/${id ?? "basic"}`)
  }

  checkAccessibility(selector?: string): Promise<void> {
    return a11y(this.page, selector)
  }

  getTrigger(value: string) {
    return this.page.locator(`[data-scope="navigation-menu"][data-part="trigger"][data-value="${value}"]`)
  }

  getContent(value: string) {
    return this.page.locator(`[data-scope="navigation-menu"][data-part="content"][data-value="${value}"]`)
  }

  getViewport() {
    return this.page.locator(`[data-scope="navigation-menu"][data-part="viewport"]`)
  }

  getLink(value: string) {
    return this.page.locator(`[data-scope="navigation-menu"][data-part="link"][data-value="${value}"]`)
  }

  getContentLink(value: string, text: string) {
    return this.getContent(value).locator("a", { hasText: text })
  }

  async focusTrigger(value: string) {
    await this.getTrigger(value).focus()
  }

  async clickTrigger(value: string) {
    await this.getTrigger(value).click()
  }

  async hoverTrigger(value: string) {
    await this.getTrigger(value).hover()
  }

  async seeTriggerIsFocused(value: string) {
    await expect(this.getTrigger(value)).toBeFocused()
  }

  async seeContent(value: string) {
    await expect(this.getContent(value)).toBeVisible()
  }

  async dontSeeContent(value: string) {
    await expect(this.getContent(value)).toBeHidden()
  }

  async seeContentLinkIsFocused(value: string, text: string) {
    await expect(this.getContentLink(value, text)).toBeFocused()
  }

  async seeLinkIsFocused(value: string) {
    await expect(this.getLink(value)).toBeFocused()
  }

  async seeContentLinksAreTabbable(value: string) {
    await expect(this.getContent(value).locator('a[tabindex="-1"]')).toHaveCount(0)
  }

  /** Queue animation frames so the next key presses land in the same frame */
  async holdFrames() {
    await this.page.evaluate(() => {
      const held: FrameRequestCallback[] = []
      const raf = window.requestAnimationFrame
      ;(window as any).__releaseFrames = () => {
        window.requestAnimationFrame = raf
        held.forEach((cb) => cb(performance.now()))
      }
      window.requestAnimationFrame = (cb) => (held.push(cb), 0)
    })
  }

  async releaseFrames() {
    await this.page.evaluate(() => (window as any).__releaseFrames())
  }

  async wait(ms: number) {
    await this.page.waitForTimeout(ms)
  }
}

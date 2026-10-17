import { expect, type Page } from "@playwright/test"
import { a11y, repeat } from "../_utils"
import { Model } from "./model"

export class ToastModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(type: "stacked" | "overlap" | "conditional-content") {
    return this.page.goto(`/toast/${type}`)
  }

  private get region() {
    return this.page.locator("[data-scope='toast'][data-part='group']")
  }

  private getCloseButton(num: number) {
    return this.page.locator("[data-scope=toast][data-part=close-trigger]").nth(num)
  }

  private getToast(num: number) {
    return this.page.getByRole("status").nth(num)
  }

  async getToastHeight(num = 0) {
    const box = await this.getToast(num).boundingBox()
    return box?.height ?? 0
  }

  // Grows the content without changing the toast's width, like a late font load
  async enlargeTitle(num = 0) {
    await this.getToast(num)
      .locator("[data-part=title]")
      .evaluate((el) => {
        ;(el as HTMLElement).style.fontSize = "2em"
      })
  }

  seeAccessibleName(value: string, num = 0) {
    return expect(this.getToast(num)).toHaveAccessibleName(value)
  }

  seeAccessibleDescription(value: string, num = 0) {
    return expect(this.getToast(num)).toHaveAccessibleDescription(value)
  }

  async dontSeeTitle(num = 0) {
    const toast = this.getToast(num)
    await expect(toast.locator("[data-part=title]")).toHaveCount(0)
    await expect(toast).not.toHaveAttribute("aria-labelledby")
  }

  async dontSeeDescription(num = 0) {
    const toast = this.getToast(num)
    await expect(toast.locator("[data-part=description]")).toHaveCount(0)
    await expect(toast).not.toHaveAttribute("aria-describedby")
  }

  async clickLoadingToast(times = 1) {
    return await repeat(times, () => this.page.getByRole("button", { name: "Notify (Loading)" }).click())
  }

  async clickErrorToast(times = 1) {
    return await repeat(times, () => this.page.getByRole("button", { name: "Notify (Error)" }).click())
  }

  async appendToLatestToast(times = 1) {
    return await repeat(times, () => this.page.getByRole("button", { name: "Append to Latest" }).click())
  }

  openDialog() {
    return this.page.getByText("Open Dialog").click()
  }

  pressHotkey() {
    return this.page.keyboard.press("Alt+T")
  }

  mouseIntoRegion() {
    return this.page.getByRole("status").first().hover()
  }

  mouseOutOfRegion() {
    return this.page.mouse.move(20, 20)
  }

  hoverNthCloseButton(num: number) {
    return this.getCloseButton(num).hover({ force: true })
  }

  clickNthCloseButton(num: number) {
    return this.getCloseButton(num).click({ force: true })
  }

  // Waits for the toast to settle, so the click can't land on a toast that's still animating in
  closeNthToast(num: number) {
    return this.getCloseButton(num).click()
  }

  seeRegionIsFocused() {
    return expect(this.region).toBeFocused()
  }

  async seeDialog() {
    await expect(this.page.locator("[role=dialog]")).toBeVisible()
  }

  async seeToastArePaused() {
    const toasts = await this.page.getByRole("status").all()
    for (const toast of toasts) {
      await expect(toast).toHaveAttribute("data-paused", "")
    }
  }

  async seeToastsAreNotPaused() {
    const toasts = await this.page.getByRole("status").all()
    for (const toast of toasts) {
      await expect(toast).not.toHaveAttribute("data-paused")
    }
  }

  seeToastIsFocused(num = 0) {
    return expect(this.getToast(num)).toBeFocused()
  }

  seeButtonIsFocused(name: string) {
    return expect(this.page.getByRole("button", { name })).toBeFocused()
  }

  async seeToast(title: string) {
    const toast = this.page.locator(`[role="status"] >> text=${title}`).first()
    await expect(toast).toBeVisible()
    await expect(toast).toContainText(title)
  }

  async seeNumOfToasts(num: number) {
    return expect(this.page.getByRole("status")).toHaveCount(num)
  }

  async seeToastsOverlap() {
    const toasts = await this.page.getByRole("status").all()
    for (const toast of toasts) {
      await expect(toast).toHaveAttribute("data-overlap", "")
    }
  }

  async seeToastsStacked() {
    const toasts = await this.page.getByRole("status").all()
    for (const toast of toasts) {
      await expect(toast).toHaveAttribute("data-stack", "")
    }
  }
}

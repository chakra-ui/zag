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

  goto() {
    return this.page.goto("/toast")
  }

  private get region() {
    return this.page.locator("[data-scope='toast'][data-part='group']")
  }

  private getCloseButton(num: number) {
    return this.page.locator("[data-scope=toast][data-part=close-trigger]").nth(num)
  }

  async clickLoadingToast(times = 1) {
    return await repeat(times, () => this.page.getByRole("button", { name: "Notify (Loading)" }).click())
  }

  async clickErrorToast(times = 1) {
    return await repeat(times, () => this.page.getByRole("button", { name: "Notify (Error)" }).click())
  }

  async clickUpdateLatest() {
    return this.page.getByRole("button", { name: "Update Latest" }).click()
  }

  async clickCloseAll() {
    return this.page.getByRole("button", { name: "Close All" }).click()
  }

  async clickPauseAll() {
    return this.page.getByRole("button", { name: "Pause All" }).click()
  }

  async clickResumeAll() {
    return this.page.getByRole("button", { name: "Resume All" }).click()
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

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

  goto(type: string) {
    return this.page.goto(`/toast/${type}`)
  }

  private get region() {
    return this.page.locator("[data-toast-group]")
  }

  clickExact(name: string, times = 1) {
    return repeat(times, () => this.page.getByRole("button", { name, exact: true }).click())
  }

  private getCloseButton(num: number) {
    return this.page.locator("[data-toast-close-trigger]").nth(num)
  }

  getToast(num = 0) {
    return this.page.getByRole("status").nth(num)
  }

  async getToastHeight(num = 0) {
    const box = await this.getToast(num).boundingBox()
    return box?.height ?? 0
  }

  // Grows the content without changing the toast's width, like a late font load
  async enlargeTitle(num = 0) {
    await this.getToast(num)
      .locator("[data-toast-title]")
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
    await expect(toast.locator("[data-toast-title]")).toHaveCount(0)
    await expect(toast).not.toHaveAttribute("aria-labelledby")
  }

  async dontSeeDescription(num = 0) {
    const toast = this.getToast(num)
    await expect(toast.locator("[data-toast-description]")).toHaveCount(0)
    await expect(toast).not.toHaveAttribute("aria-describedby")
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

  seeToastType(type: string, num = 0) {
    return expect(this.getToast(num)).toHaveAttribute("data-type", type)
  }

  seeToastText(texts: string[]) {
    return expect(this.page.getByRole("status")).toHaveText(texts.map((text) => new RegExp(text)))
  }

  clickAction(name: string) {
    return this.getToast().getByRole("button", { name }).click()
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
    return expect(this.page.getByRole("button", { name, exact: true })).toBeFocused()
  }

  async seeToast(title: string) {
    const toast = this.page.locator(`[role="status"] >> text=${title}`).first()
    await expect(toast).toBeVisible()
    await expect(toast).toContainText(title)
  }

  async seeNumOfToasts(num: number) {
    return expect(this.page.getByRole("status")).toHaveCount(num)
  }

  // One locator, so a toast removed mid-check can't leave a stale handle behind
  async seeToastsOverlap() {
    await expect(this.page.getByRole("status").first()).toBeVisible()
    await expect(this.page.locator("[data-toast-root]:not([data-overlap])")).toHaveCount(0)
  }

  // Hovering waits for the toast to stop moving, so a press can't land mid enter-animation.
  // Left of center keeps the press off the close button.
  private async pointAtToast(num = 0) {
    const toast = this.getToast(num)
    const size = await toast.evaluate((el) => ({ width: el.offsetWidth, height: el.offsetHeight }))
    const position = { x: size.width * 0.3, y: size.height / 2 }
    await toast.hover({ position })
    const box = await toast.boundingBox()
    if (!box) throw new Error("toast is not visible")
    return { x: box.x + position.x, y: box.y + position.y }
  }

  /**
   * Drags the toast with the mouse. `back` pulls the pointer back along x before releasing.
   */
  async swipe(delta: { x?: number; y?: number }, options: { num?: number; back?: number; release?: boolean } = {}) {
    const { num = 0, back = 0, release = true } = options
    const start = await this.pointAtToast(num)
    const end = { x: start.x + (delta.x ?? 0), y: start.y + (delta.y ?? 0) }

    await this.page.mouse.move(start.x, start.y)
    await this.page.mouse.down()
    await this.page.mouse.move(end.x, end.y, { steps: 10 })
    if (back) await this.page.mouse.move(end.x - back, end.y, { steps: 5 })
    if (release) await this.page.mouse.up()
  }

  // A small horizontal start locks the axis before the pointer turns vertical
  async swipeTurning(delta: { x: number; y: number }, num = 0) {
    const start = await this.pointAtToast(num)
    await this.page.mouse.move(start.x, start.y)
    await this.page.mouse.down()
    await this.page.mouse.move(start.x + 8, start.y + 1, { steps: 2 })
    await this.page.mouse.move(start.x + delta.x, start.y + delta.y, { steps: 10 })
    await this.page.mouse.up()
  }

  async pressAndDragWithButton(button: "right" | "middle", delta: { x: number }) {
    const start = await this.pointAtToast()
    await this.page.mouse.move(start.x, start.y)
    await this.page.mouse.down({ button })
    await this.page.mouse.move(start.x + delta.x, start.y, { steps: 10 })
    await this.page.mouse.up({ button })
  }

  ignoreSwipeOnTitle(num = 0) {
    return this.getToast(num)
      .locator("[data-toast-title]")
      .evaluate((el) => el.setAttribute("data-swipe-ignore", ""))
  }

  async swipeFromTitle(delta: { x: number }) {
    const title = this.getToast().locator("[data-toast-title]")
    await title.hover({ position: { x: 4, y: 4 } })
    const box = await title.boundingBox()
    if (!box) throw new Error("title is not visible")
    await this.page.mouse.move(box.x + 4, box.y + box.height / 2)
    await this.page.mouse.down()
    await this.page.mouse.move(box.x + 4 + delta.x, box.y + box.height / 2, { steps: 10 })
    await this.page.mouse.up()
  }

  seeSwiping(num = 0) {
    return expect(this.getToast(num)).toHaveAttribute("data-swiping", "")
  }

  dontSeeSwiping(num = 0) {
    return expect(this.getToast(num)).not.toHaveAttribute("data-swiping")
  }

  seeSwipeDirection(direction: string, num = 0) {
    return expect(this.getToast(num)).toHaveAttribute("data-swipe-direction", direction)
  }

  async seeSwipeReset(num = 0) {
    const toast = this.getToast(num)
    await expect(toast).toHaveAttribute("data-state", "open")
    await expect(toast).not.toHaveAttribute("data-swiping")
    await expect(toast).not.toHaveAttribute("data-swipe-direction")
    await expect(toast).toHaveCSS("--swipe-x", "0px")
    await expect(toast).toHaveCSS("--swipe-y", "0px")
  }

  async getSwipeOffset(num = 0) {
    return this.getToast(num).evaluate((el) => ({
      x: parseFloat((el as HTMLElement).style.getPropertyValue("--swipe-x")),
      y: parseFloat((el as HTMLElement).style.getPropertyValue("--swipe-y")),
    }))
  }

  getContent(num = 0) {
    return this.getToast(num).locator("[data-toast-content]")
  }

  async seeToastsStacked() {
    await expect(this.page.getByRole("status").first()).toBeVisible()
    await expect(this.page.locator("[data-toast-root]:not([data-stack])")).toHaveCount(0)
  }

  // Toasts slide into place, so wait until the layout settles
  async seeToastsDontOverlap(count: number) {
    await expect(async () => {
      const boxes = await Promise.all(Array.from({ length: count }, (_, i) => this.getToast(i).boundingBox()))
      const sorted = boxes.map((box) => box!).sort((a, b) => a.y - b.y)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].y + sorted[i - 1].height).toBeLessThanOrEqual(sorted[i].y)
      }
    }).toPass()
  }
}

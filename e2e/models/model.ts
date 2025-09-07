import { expect, type Page } from "@playwright/test"
import { a11y, clickOutside, clickViz, controls, DOM_MODE, repeat } from "../_utils"

export class Model {
  constructor(
    public page: Page,
    private shadowHost?: string,
  ) {}

  get host() {
    return DOM_MODE === "shadow-dom" && this.shadowHost ? this.page.locator(this.shadowHost) : this.page
  }

  get controls() {
    return controls(this.page)
  }

  clickViz() {
    return clickViz(this.page)
  }

  clickOutside() {
    return clickOutside(this.page)
  }

  checkAccessibility(selector?: string) {
    return a11y(this.page, selector, this.shadowHost)
  }

  pressKey(key: string, times = 1) {
    return repeat(times, () => this.page.keyboard.press(key))
  }

  pressKeyDown(key: string, times = 1) {
    return repeat(times, () => this.page.keyboard.down("ArrowDown"))
  }

  pressKeyUp(key: string, times = 1) {
    return repeat(times, () => this.page.keyboard.up("ArrowUp"))
  }

  rightClick(selector: string) {
    return this.page.locator(selector).click({ button: "right" })
  }

  type(value: string) {
    return this.page.keyboard.type(value)
  }

  seeCaretAt = async (position: number) => {
    const value = await this.page.evaluate(() => {
      const el = document.activeElement
      try {
        return (el as any).selectionStart
      } catch {
        return -1
      }
    })
    expect(value).toBe(position)
  }

  moveCursorTo(pos: { x: number; y: number }) {
    return this.page.mouse.move(pos.x, pos.y)
  }

  attachFile(selector: string, path: string) {
    return this.page.setInputFiles(selector, path)
  }

  resizeWindow(size: { width: number; height: number }) {
    return this.page.setViewportSize(size)
  }

  async wait(time: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, time))
  }

  async mouseup() {
    await this.page.mouse.up()
  }

  click(text: string) {
    return this.page.getByText(text).click()
  }

  see(text: string, context?: string) {
    const locator = context ? this.page.locator(context).getByText(text) : this.page.getByText(text)
    return expect(locator).toBeVisible()
  }

  dontSee(text: string, context?: string) {
    const locator = context ? this.page.locator(context).getByText(text) : this.page.getByText(text)
    return expect(locator).not.toBeVisible()
  }
}

import { type Page, expect } from "@playwright/test"
import { controls, repeat } from "../_utils"

export class Model {
  constructor(public page: Page) {}

  get setContext() {
    return controls(this.page)
  }

  pressEsc(times = 1) {
    return repeat(times, () => this.page.keyboard.press("Escape"))
  }

  pressEnter(times = 1) {
    return repeat(times, () => this.page.keyboard.press("Enter"))
  }

  pressBackspace(times = 1) {
    return repeat(times, () => this.page.keyboard.press("Backspace"))
  }

  pressArrowLeft(times = 1) {
    return repeat(times, () => this.page.keyboard.press("ArrowLeft"))
  }

  pressArrowRight(times = 1) {
    return repeat(times, () => this.page.keyboard.press("ArrowRight"))
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
      } catch (error) {
        return -1
      }
    })
    expect(value).toBe(position)
  }
}

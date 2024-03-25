import { type Page } from "@playwright/test"
import { controls, repeat } from "../_utils"

export class Model {
  constructor(public page: Page) {}

  get controls() {
    return controls(this.page)
  }

  esc(times = 1) {
    return repeat(times, () => this.page.keyboard.press("Escape"))
  }

  enter(times = 1) {
    return repeat(times, () => this.page.keyboard.press("Enter"))
  }

  backspace(times = 1) {
    return repeat(times, () => this.page.keyboard.press("Backspace"))
  }

  arrowLeft(times = 1) {
    return repeat(times, () => this.page.keyboard.press("ArrowLeft"))
  }

  arrowRight(times = 1) {
    return repeat(times, () => this.page.keyboard.press("ArrowRight"))
  }

  type(value: string) {
    return this.page.keyboard.type(value)
  }
}

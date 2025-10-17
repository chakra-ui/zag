import { type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class AngleSliderModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/angle-slider") {
    return this.page.goto(url)
  }

  get thumb() {
    return this.page.locator("[data-scope='angle-slider'][data-part='thumb']")
  }

  get control() {
    return this.page.locator("[data-scope='angle-slider'][data-part='control']")
  }

  get output() {
    return this.page.locator("[data-scope='angle-slider'][data-part='value-text']")
  }

  focusThumb() {
    return this.thumb.focus()
  }
}

import { expect, type Page } from "@playwright/test"
import { a11y, repeat } from "../_utils"
import { Model } from "./model"

export class PaginationModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/pagination") {
    return this.page.goto(url)
  }

  getItem = (text: string) => {
    return this.page.locator(`[data-scope=pagination][data-testid=item-${text}]`)
  }

  get nextTrigger() {
    return this.page.locator("[data-scope=pagination][data-part=next-trigger]")
  }

  get prevTrigger() {
    return this.page.locator("[data-scope=pagination][data-part=prev-trigger]")
  }

  get output() {
    return this.page.getByTestId("output")
  }

  clickItem = async (text: string) => {
    await this.getItem(text).click()
  }

  seeItemIsCurrent = async (text: string) => {
    await expect(this.getItem(text)).toHaveAttribute("aria-current", "page")
  }

  seeItemIsSelected = async (text: string) => {
    await expect(this.getItem(text)).toHaveAttribute("data-selected")
  }

  clickNext = async (times = 1) => {
    await repeat(times, () => this.nextTrigger.click())
  }

  clickPrev = async (times = 1) => {
    await repeat(times, () => this.prevTrigger.click())
  }

  seeOutputContains = async (text: string) => {
    await expect(this.output).toContainText(text)
  }
}

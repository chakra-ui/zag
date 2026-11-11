import { expect, type Page } from "@playwright/test"
import { part } from "../_utils"
import { Model } from "./model"

export class ProgressModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(example = "basic") {
    return this.page.goto(`/progress/${example}`)
  }

  getBar(name?: string) {
    return name ? this.page.getByRole("progressbar", { name }) : this.page.getByRole("progressbar").first()
  }

  getRange() {
    return this.page.locator(part("progress", "range")).first()
  }

  getValueText() {
    return this.page.locator(part("progress", "value-text")).first()
  }

  async click(name: string, times = 1) {
    for (let i = 0; i < times; i++) await this.page.getByRole("button", { name, exact: true }).click()
  }

  async seeValue(value: string, valueText: string) {
    await expect(this.getBar()).toHaveAttribute("aria-valuenow", value)
    await expect(this.getBar()).toHaveAttribute("aria-valuetext", valueText)
    await expect(this.getValueText()).toHaveText(valueText)
  }

  async seeIndeterminate() {
    await expect(this.getBar()).toHaveAttribute("data-state", "indeterminate")
    await expect(this.getBar()).not.toHaveAttribute("aria-valuenow")
    await expect(this.getBar()).not.toHaveAttribute("aria-valuetext")
  }

  async seeState(state: "loading" | "complete" | "indeterminate") {
    await expect(this.getBar()).toHaveAttribute("data-state", state)
    await expect(this.getRange()).toHaveAttribute("data-state", state)
  }

  async seeRangePercent(percent: string) {
    await expect(this.getRange()).toHaveAttribute("style", new RegExp(`width:\\s*${percent}%`))
  }
}

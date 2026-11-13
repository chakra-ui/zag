import { expect, type Page } from "@playwright/test"
import { part } from "../_utils"
import { Model } from "./model"

export class MeterModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(example = "basic") {
    return this.page.goto(`/meter/${example}`)
  }

  getRoot() {
    return this.page.locator(part("meter", "root")).first()
  }

  getIndicator() {
    return this.page.locator(part("meter", "indicator")).first()
  }

  getValueText() {
    return this.page.locator(part("meter", "value-text")).first()
  }

  async clickButton(name: string) {
    await this.page.getByRole("button", { name, exact: true }).click()
  }

  async seeIndicatorPercent(percent: string) {
    await expect(this.getIndicator()).toHaveAttribute("style", new RegExp(`width:\\s*${percent}%`))
  }

  async setValue(value: number) {
    await this.page.getByTestId(`set-${value}`).click()
  }

  async seeValue(value: string) {
    await expect(this.getRoot()).toHaveAttribute("aria-valuenow", value)
  }

  async seeState(state: string) {
    await expect(this.getRoot()).toHaveAttribute("data-state", state)
    await expect(this.getIndicator()).toHaveAttribute("data-state", state)
  }
}

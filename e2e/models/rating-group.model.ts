import { expect, type Locator, type Page } from "@playwright/test"
import { a11y, part, testid } from "../_utils"
import { Model } from "./model"

export class RatingGroupModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto() {
    return this.page.goto("/rating-group")
  }

  checkAccessibility(selector?: string): Promise<void> {
    return a11y(this.page, selector)
  }

  get control() {
    return this.page.locator(part("control"))
  }

  get hiddenInput() {
    return this.page.locator(testid("hidden-input"))
  }

  get label() {
    return this.page.locator(part("label"))
  }

  getRating(value: number): Locator {
    return this.page.locator(part("item")).nth(value - 1)
  }

  async hoverOut() {
    await this.page.hover("main")
  }

  async clickRating(value: number) {
    await this.getRating(value).click()
  }

  async clickLabel() {
    await this.label.click()
  }

  async focusRating(value: number) {
    await this.getRating(value).focus()
  }

  async hoverRating(value: number) {
    const el = this.getRating(value)
    await el.hover()
    await el.dispatchEvent("pointermove", { button: 0 })
  }

  async seeRatingIsHighlighted(value: number) {
    await expect(this.getRating(value)).toHaveAttribute("data-highlighted", "")
  }

  async seeRatingIsDisabled(value: number) {
    await expect(this.getRating(value)).toHaveAttribute("data-disabled", "")
  }

  async seeControlIsDisabled() {
    await expect(this.control).toHaveAttribute("data-disabled", "")
  }

  async seeRatingIsFocused(value: number) {
    await expect(this.getRating(value)).toBeFocused()
  }

  async seeInputHasValue(value: string) {
    await expect(this.hiddenInput).toHaveValue(value)
  }

  async seeAllRatingsAreDisabled() {
    const items = this.page.locator(part("item"))
    const isAllItemsDisabled = await items.evaluateAll((items) => items.every((item) => item.dataset.disabled === ""))
    expect(isAllItemsDisabled).toBeTruthy()
  }

  async seeAllRatingsAreReadonly() {
    const items = this.page.locator(part("item"))
    const isAllItemsReadonly = await items.evaluateAll((items) => items.every((item) => item.dataset.readonly === ""))
    expect(isAllItemsReadonly).toBeTruthy()
  }
}

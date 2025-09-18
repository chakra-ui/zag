import { expect, type Page } from "@playwright/test"
import { a11y, part, swipe, type SwipeDirection } from "../_utils"
import { Model } from "./model"

export class CarouselModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/carousel") {
    return this.page.goto(url)
  }

  checkAccessibility(selector?: string): Promise<void> {
    return a11y(this.page, selector)
  }

  getItem(index: number) {
    return this.page.locator(part("item")).nth(index)
  }

  getIndicator(index: number) {
    return this.page.locator(part("indicator")).nth(index)
  }

  get prevTrigger() {
    return this.page.locator(part("prev-trigger"))
  }

  get nextTrigger() {
    return this.page.locator(part("next-trigger"))
  }

  get autoplayTrigger() {
    return this.page.locator(part("autoplay-trigger"))
  }

  get carousel() {
    return this.page.locator(part("item-group"))
  }

  async clickPrevTrigger() {
    await this.prevTrigger.click()
  }

  async clickNextTrigger() {
    await this.nextTrigger.click()
  }

  async clickAutoplayTrigger() {
    await this.autoplayTrigger.click()
  }

  async clickIndicator(index: number) {
    await this.getIndicator(index).click()
  }

  async focusIndicator(index: number) {
    await this.getIndicator(index).focus()
  }

  async swipeCarousel(direction: SwipeDirection, distance: number = 100, duration: number = 500) {
    await swipe(this.page, this.carousel, direction, distance, duration)
  }

  async clickScrollToButton(index: number) {
    await this.page.getByRole("button", { name: `Scroll to ${index}` }).click()
  }

  async seeAutoplayIsOn() {
    await expect(this.autoplayTrigger).toHaveText("Stop")
  }

  async seeAutoplayIsOff() {
    await expect(this.autoplayTrigger).toHaveText("Play")
  }

  async seeNumOfItems(count: number) {
    await expect(this.carousel).toBeVisible()
    const items = this.page.locator(part("item"))
    await expect(items).toHaveCount(count)
  }

  async seeItemInView(index: number) {
    await expect(this.getItem(index)).toHaveAttribute("data-inview", "")
  }

  async seePrevTriggerIsDisabled() {
    await expect(this.prevTrigger).toBeDisabled()
  }

  async seePrevTriggerIsEnabled() {
    await expect(this.prevTrigger).toBeEnabled()
  }

  async seeNextTriggerIsDisabled() {
    await expect(this.nextTrigger).toBeDisabled()
  }

  async seeNextTriggerIsEnabled() {
    await expect(this.nextTrigger).toBeEnabled()
  }

  async dontSeeItemInView(index: number) {
    await expect(this.getItem(index)).not.toHaveAttribute("data-inview", "")
  }

  async seeIndicatorIsActive(index: number) {
    await expect(this.getIndicator(index)).toHaveAttribute("data-current", "")
  }

  async seeIndicatorIsInactive(index: number) {
    await expect(this.getIndicator(index)).not.toHaveAttribute("data-current", "")
  }
}

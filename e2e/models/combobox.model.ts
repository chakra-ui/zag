import { expect, type Page } from "@playwright/test"
import { a11y, isInViewport } from "../_utils"
import { Model } from "./model"

export class ComboboxModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto() {
    return this.page.goto("/combobox")
  }

  private get input() {
    return this.page.locator("[data-part=input]")
  }

  private get trigger() {
    return this.page.locator("[data-part=trigger]")
  }

  private get clearTrigger() {
    return this.page.locator("[data-part=clear-trigger]")
  }

  private get content() {
    return this.page.locator("[data-part=content]")
  }

  private get items() {
    const options = "[data-part=item]:not([data-disabled])"
    return this.page.locator(options)
  }

  getItem = (text: string) => {
    return this.page.locator(`[data-part=item]`, { hasText: text })
  }

  get highlightedItem() {
    return this.page.locator("[data-part=item][data-highlighted]")
  }

  type(input: string) {
    return this.input.pressSequentially(input)
  }

  clickInput = async () => {
    await this.input.click({ force: true })
  }

  clickTrigger = async () => {
    await this.trigger.click()
  }

  clickClearTrigger = async () => {
    await this.clearTrigger.click()
  }

  hoverItem = async (text: string) => {
    await this.getItem(text).hover()
  }

  clickItem = async (text: string) => {
    await this.getItem(text).click()
  }

  focusInput = async () => {
    await this.input.focus()
  }

  seeDropdown = async () => {
    await expect(this.content).toBeVisible()
  }

  dontSeeDropdown = async () => {
    await expect(this.content).not.toBeVisible()
  }

  seeNumberOfItems = async (count: number) => {
    const _count = await this.items.count()
    expect(_count).toBe(count)
  }

  seeItemIsHighlighted = async (text: string) => {
    const item = this.getItem(text)
    await expect(item).toHaveAttribute("data-highlighted", "")
  }

  seeItemIsChecked = async (text: string) => {
    const item = this.getItem(text)
    await expect(item).toHaveAttribute("data-state", "checked")
  }

  seeItemIsNotChecked = async (text: string) => {
    const item = this.getItem(text)
    await expect(item).not.toHaveAttribute("data-state", "checked")
  }

  seeItemInViewport = async (text: string) => {
    const item = this.getItem(text)
    expect(await isInViewport(this.content, item)).toBe(true)
  }

  seeInputHasValue = async (value: string) => {
    await expect(this.input).toHaveValue(value)
  }

  seeInputIsFocused = async () => {
    await expect(this.input).toBeFocused()
  }

  dontSeeHighlightedItem = async () => {
    expect(await this.highlightedItem.count()).toBe(0)
  }
}

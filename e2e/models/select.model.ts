import { expect, type Page } from "@playwright/test"
import { a11y, isInViewport, pointer } from "../_utils"
import { Model } from "./model"

export class SelectModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, ".select")
  }

  goto(url = "/select") {
    return this.page.goto(url)
  }

  private get trigger() {
    return this.page.locator("[data-scope=select][data-part=trigger]")
  }

  private get content() {
    return this.page.locator("[data-scope=select][data-part=content]")
  }

  private get label() {
    return this.page.locator("[data-scope=select][data-part=label]")
  }

  private get clearTrigger() {
    return this.page.locator("[data-scope=select][data-part=clear-trigger]")
  }

  getItem = (text: string) => {
    return this.page.locator(`[data-part=item]`, { hasText: text })
  }

  get highlightedItem() {
    return this.page.locator("[data-part=item][data-highlighted]")
  }

  type(input: string) {
    return this.content.pressSequentially(input)
  }

  focusTrigger = async () => {
    await this.trigger.focus()
  }

  clickLabel = async () => {
    await this.label.click()
  }

  pointerDownTrigger = async () => {
    await pointer.down(this.trigger)
  }

  clickTrigger = async () => {
    await this.trigger.click()
  }

  clickClearTrigger = async () => {
    await this.clearTrigger.click()
  }

  clickItem = async (text: string) => {
    await this.getItem(text).click()
  }

  hoverItem = async (text: string) => {
    await this.getItem(text).hover()
  }

  pointerUpItem = async (text: string) => {
    await pointer.up(this.getItem(text))
  }

  hoverOut = async () => {
    await this.page.mouse.move(0, 0)
  }

  seeTriggerIsFocused = async () => {
    await expect(this.trigger).toBeFocused()
  }

  seeTriggerHasText = async (text: string) => {
    await expect(this.trigger).toContainText(text)
  }

  seeDropdown = async () => {
    await expect(this.content).toBeVisible()
  }

  dontSeeDropdown = async () => {
    await expect(this.content).not.toBeVisible()
  }

  seeDropdownIsFocused = async () => {
    await expect(this.content).toBeFocused()
  }

  seeItemIsHighlighted = async (text: string) => {
    const item = this.getItem(text)
    await expect(item).toHaveAttribute("data-highlighted", "")
  }

  dontSeeHighlightedItem = async () => {
    await expect(this.highlightedItem).not.toBeVisible()
  }

  seeItemIsChecked = async (text: string) => {
    const item = this.getItem(text)
    await expect(item).toHaveAttribute("data-state", "checked")
  }

  seeItemInViewport = async (text: string) => {
    const item = this.getItem(text)
    expect(await isInViewport(this.content, item)).toBe(true)
  }
}

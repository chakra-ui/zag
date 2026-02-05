import { expect, type Page } from "@playwright/test"
import { a11y, isInViewport } from "../_utils"
import { Model } from "./model"

export class CascadeSelectModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, ".cascade-select")
  }

  goto(url = "/cascade-select") {
    return this.page.goto(url)
  }

  private get trigger() {
    return this.page.locator("[data-scope=cascade-select][data-part=trigger]")
  }

  private get content() {
    return this.page.locator("[data-scope=cascade-select][data-part=content]")
  }

  private get label() {
    return this.page.locator("[data-scope=cascade-select][data-part=label]")
  }

  private get clearTrigger() {
    return this.page.locator("[data-scope=cascade-select][data-part=clear-trigger]")
  }

  getItem = (text: string) => {
    // Use item-text element for exact text matching to avoid partial matches
    // e.g., "Africa" should not match "South Africa" or "Central African Republic"
    return this.page.locator(`[data-part=item]`).filter({
      has: this.page.locator(`[data-part=item-text]`, { hasText: new RegExp(`^${text}$`) }),
    })
  }

  getList = (depth: number) => {
    return this.page.locator(`[data-part=list][data-depth="${depth}"]`)
  }

  get highlightedItems() {
    return this.page.locator("[data-part=item][data-highlighted]")
  }

  get selectedItems() {
    return this.page.locator("[data-part=item][data-state='checked']")
  }

  focusTrigger = async () => {
    await this.trigger.focus()
  }

  clickLabel = async () => {
    await this.label.click()
  }

  clickTrigger = async () => {
    await this.trigger.click()
  }

  clickTriggerForced = async () => {
    await this.trigger.click({ force: true })
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

  hoverOut = async () => {
    await this.content.hover({ position: { x: 0, y: 0 } })
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

  seeItemIsHighlighted = async (text: string) => {
    const item = this.getItem(text)
    await expect(item).toHaveAttribute("data-highlighted")
  }

  dontSeeHighlightedItems = async () => {
    await expect(this.highlightedItems).toHaveCount(0)
  }

  seeItemInViewport = async (text: string) => {
    const item = this.getItem(text)
    expect(await isInViewport(this.content, item)).toBe(true)
  }

  seeList = async (depth: number) => {
    await expect(this.getList(depth)).toBeVisible()
  }

  dontSeeList = async (depth: number) => {
    await expect(this.getList(depth)).not.toBeVisible()
  }

  seeItemHasIndicator = async (text: string) => {
    const item = this.getItem(text)
    const indicator = item.locator("[data-part=item-indicator]")
    await expect(indicator).toBeVisible()
  }

  dontSeeItemHasIndicator = async (text: string) => {
    const item = this.getItem(text)
    const indicator = item.locator("[data-part=item-indicator]")
    await expect(indicator).not.toBeVisible()
  }

  seeHighlightedItemsCount = async (count: number) => {
    await expect(this.highlightedItems).toHaveCount(count)
  }

  seeSelectedItemsCount = async (count: number) => {
    await expect(this.selectedItems).toHaveCount(count)
  }

  seeClearTrigger = async () => {
    await expect(this.clearTrigger).toBeVisible()
  }

  dontSeeClearTrigger = async () => {
    await expect(this.clearTrigger).not.toBeVisible()
  }
}

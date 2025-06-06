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

  private get valueText() {
    return this.page.locator("[data-scope=cascade-select][data-part=value-text]")
  }

  getItem = (text: string) => {
    return this.page.locator(`[data-part=item]`).filter({ hasText: new RegExp(`^${text}$`) })
  }

  getLevel = (level: number) => {
    return this.page.locator(`[data-part=level][data-level="${level}"]`)
  }

  get highlightedItems() {
    return this.page.locator("[data-part=item][data-highlighted]")
  }

  get selectedItems() {
    return this.page.locator("[data-part=item][data-selected]")
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

  seeTriggerIsFocused = async () => {
    await expect(this.trigger).toBeFocused()
  }

  seeTriggerHasText = async (text: string) => {
    await expect(this.valueText).toContainText(text)
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

  seeLevel = async (level: number) => {
    await expect(this.getLevel(level)).toBeVisible()
  }

  dontSeeLevel = async (level: number) => {
    await expect(this.getLevel(level)).not.toBeVisible()
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

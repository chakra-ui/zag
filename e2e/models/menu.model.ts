import { expect, type Page } from "@playwright/test"
import { a11y, getFocusPosition, isInViewport } from "../_utils"
import { Model } from "./model"

export class MenuModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, "main")
  }

  goto(url = "/menu/basic") {
    return this.page.goto(url)
  }

  private get trigger() {
    return this.page.locator("[data-menu-trigger]")
  }

  private get contextTrigger() {
    return this.page.locator("[data-menu-context-trigger]")
  }

  private get content() {
    return this.page.locator("[data-menu-content]")
  }

  /** The trigger with this value, or the first one */
  getTrigger(value?: string) {
    if (value == null) return this.trigger.first()
    return this.page.locator(`[data-menu-trigger][data-value="${value}"]`)
  }

  /** The content for this trigger value, or the only one */
  getContent(value?: string) {
    if (value == null) return this.content
    return this.page.locator(`[data-menu-content][data-value="${value}"]`)
  }

  get positioner() {
    return this.page.locator("[data-menu-positioner]")
  }

  get viewport() {
    return this.page.locator("[data-menu-viewport]")
  }

  get arrow() {
    return this.page.locator("[data-menu-arrow]")
  }

  seePositionerIsTransitioning() {
    return this.seeDataAttr(this.positioner, "transitioning")
  }

  seePositionerIsNotTransitioning() {
    return this.dontSeeDataAttr(this.positioner, "transitioning")
  }

  getItem = (text: string) => {
    return this.page.locator(`[data-menu-item]`, { hasText: text })
  }

  get highlightedItem() {
    return this.page.locator("[data-menu-item][data-highlighted]")
  }

  type(input: string) {
    return this.content.pressSequentially(input)
  }

  focusTrigger = async () => {
    await this.trigger.focus()
  }

  clickTrigger = async () => {
    await this.trigger.click()
  }

  seeFocusAfterTrigger = async () => {
    await expect.poll(() => getFocusPosition(this.trigger.first(), { skip: "[data-menu-positioner]" })).toBe("after")
  }

  seeFocusBeforeTrigger = async () => {
    await expect.poll(() => getFocusPosition(this.trigger.first(), { skip: "[data-menu-positioner]" })).toBe("before")
  }

  seeTriggerIsFocused = async () => {
    await expect(this.trigger).toBeFocused()
  }

  clickContextTrigger = async (options: { button?: "left" | "right" } = {}) => {
    await this.contextTrigger.click(options)
  }

  clickItem = async (text: string) => {
    await this.getItem(text).click()
  }

  hoverItem = async (text: string) => {
    await this.getItem(text).hover()
  }

  get searchInput() {
    return this.page.getByLabel("Search")
  }

  hoverTrigger = async () => {
    await this.trigger.hover()
  }

  seeSearchIsFocused = async () => {
    await expect(this.searchInput).toBeFocused()
  }

  hoverOut = async () => {
    await this.page.mouse.move(0, 0)
  }

  seeTriggerIsCollapsed = async () => {
    await expect(this.trigger).toHaveAttribute("aria-expanded", "false")
  }

  seeDropdownIsFocused = async () => {
    await expect(this.content).toBeFocused()
  }

  seeDropdown = async () => {
    await expect(this.content).toBeVisible()
  }

  dontSeeDropdown = async () => {
    await expect(this.content).not.toBeVisible()
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

  seeItemIsNotChecked = async (text: string) => {
    const item = this.getItem(text)
    await expect(item).not.toHaveAttribute("data-state", "checked")
  }

  seeItemInViewport = async (text: string) => {
    const item = this.getItem(text)
    expect(await isInViewport(this.content, item)).toBe(true)
  }

  seeHighlightedItemText = async (text: string) => {
    await expect(this.highlightedItem).toHaveText(text)
  }

  seeHighlightedItemInViewport = async () => {
    await expect.poll(() => isInViewport(this.content, this.highlightedItem)).toBe(true)
  }

  seeSelectedValue = async (value: string) => {
    await expect(this.page.getByRole("status", { name: "Selected item" })).toHaveText(value)
  }

  seeMenuIsPositioned = async () => {
    const positioner = this.page.locator("[data-menu-positioner]")
    await expect(positioner).toHaveCSS("--x", /\d+px/)
    await expect(positioner).toHaveCSS("--y", /\d+px/)
  }

  getContextTriggerPoint = async (): Promise<{ x: number; y: number }> => {
    const box = await this.contextTrigger.boundingBox()
    if (!box) throw new Error("context trigger not found")
    return { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) }
  }

  private dispatchContextTriggerTouch = async (type: "pointerdown" | "pointerup", point: { x: number; y: number }) => {
    await this.contextTrigger.dispatchEvent(type, {
      pointerType: "touch",
      pointerId: 2,
      isPrimary: true,
      bubbles: true,
      clientX: point.x,
      clientY: point.y,
    })
  }

  longPressContextTrigger = async (point: { x: number; y: number }) => {
    await this.dispatchContextTriggerTouch("pointerdown", point)
  }

  tapContextTrigger = async (point: { x: number; y: number }) => {
    await this.dispatchContextTriggerTouch("pointerdown", point)
    await this.dispatchContextTriggerTouch("pointerup", point)
  }

  seeMenuIsPositionedNear = async (point: { x: number; y: number }, tolerance = 24) => {
    const positioner = this.page.locator("[data-menu-positioner]")
    await expect(async () => {
      const box = await positioner.boundingBox()
      expect(box).not.toBeNull()
      expect(Math.abs(box!.x - point.x)).toBeLessThanOrEqual(tolerance)
      expect(Math.abs(box!.y - point.y)).toBeLessThanOrEqual(tolerance)
    }).toPass({ timeout: 2000 })
  }
}

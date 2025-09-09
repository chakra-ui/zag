import { expect, type Page } from "@playwright/test"
import { isInViewport } from "../_utils"
import { Model } from "./model"

export class MenuModel extends Model {
  constructor(
    public page: Page,
    shadowHost = "menu-page",
  ) {
    super(page, shadowHost)
  }

  checkAccessibility(): Promise<void> {
    // return a11y(this.page, "main", shadowHost)
    return super.checkAccessibility("main")
  }

  goto(url = "/menu") {
    return this.page.goto(url)
  }

  private get trigger() {
    return this.host.locator("[data-scope=menu][data-part=trigger]")
  }

  private get contextTrigger() {
    return this.host.locator("[data-scope=menu][data-part=context-trigger]")
  }

  private get content() {
    return this.host.locator("[data-scope=menu][data-part=content]")
  }

  getItem = (text: string) => {
    return this.host.locator(`[data-part=item]`, { hasText: text })
  }

  get highlightedItem() {
    return this.host.locator("[data-part=item][data-highlighted]")
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

  clickContextTrigger = async (options: { button?: "left" | "right" } = {}) => {
    await this.contextTrigger.click(options)
  }

  clickItem = async (text: string) => {
    await this.getItem(text).click()
  }

  hoverItem = async (text: string) => {
    await this.getItem(text).hover()
  }

  hoverOut = async () => {
    await this.page.mouse.move(0, 0)
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

  seeMenuIsPositioned = async () => {
    const positioner = this.host.locator("[data-scope=menu][data-part=positioner]")
    await expect(positioner).toHaveCSS("--x", /\d+px/)
    await expect(positioner).toHaveCSS("--y", /\d+px/)
  }
}

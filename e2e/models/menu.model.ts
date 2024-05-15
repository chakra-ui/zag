import { expect, type Page } from "@playwright/test"
import { a11y, isInViewport } from "../_utils"
import { Model } from "./model"

export class MenuModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, "main")
  }

  goto(url = "/menu") {
    return this.page.goto(url)
  }

  private get trigger() {
    return this.page.locator("[data-scope=menu][data-part=trigger]")
  }

  private get content() {
    return this.page.locator("[data-scope=menu][data-part=content]")
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

  clickTrigger = async () => {
    await this.trigger.click()
  }

  hoverItem = async (text: string) => {
    await this.getItem(text).hover()
  }

  hoverOut = async () => {
    await this.page.mouse.move(0, 0)
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
}

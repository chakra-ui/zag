import { expect, type Page } from "@playwright/test"
import { a11y, getFocusPosition, isInViewport, pointer } from "../_utils"
import { Model } from "./model"

export class SelectModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, ".select")
  }

  goto(url = "/select/basic") {
    return this.page.goto(url)
  }

  private get trigger() {
    return this.page.locator("[data-select-trigger]").first()
  }

  private get content() {
    return this.page.locator("[data-select-content]").first()
  }

  private get list() {
    return this.page.locator("[data-select-list]")
  }

  private get label() {
    return this.page.locator("[data-select-label]")
  }

  private get clearTrigger() {
    return this.page.locator("[data-select-clear-trigger]")
  }

  getItem = (text: string) => {
    return this.page.locator(`[data-select-item]`, { hasText: text })
  }

  get highlightedItem() {
    return this.page.locator("[data-select-item][data-highlighted]")
  }

  type(input: string) {
    return this.list.pressSequentially(input)
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

  pressTrigger = async () => {
    const box = await this.trigger.boundingBox()
    if (!box) throw new Error("Trigger not found")
    await this.page.mouse.move(box.x + 16, box.y + box.height / 2)
    await this.page.mouse.down()
  }

  dragToItem = async (text: string) => {
    const box = await this.getItem(text).boundingBox()
    if (!box) throw new Error(`Item ${text} not found`)
    await this.page.mouse.move(box.x + 16, box.y + box.height / 2, { steps: 8 })
  }

  nudgeMouse = async (dx: number, dy: number) => {
    const box = await this.trigger.boundingBox()
    if (!box) throw new Error("Trigger not found")
    await this.page.mouse.move(box.x + 16 + dx, box.y + box.height / 2 + dy, { steps: 4 })
  }

  holdFor = async (ms: number) => {
    await this.page.waitForTimeout(ms)
  }

  releaseMouse = async () => {
    await this.page.mouse.up()
  }

  renderContentAfterTrigger = async () => {
    await this.page.evaluate(() => {
      const trigger = document.querySelector("[data-select-trigger]")
      const positioner = document.querySelector("[data-select-positioner]")
      if (!trigger || !positioner) throw new Error("Trigger or positioner not found")
      trigger.insertAdjacentElement("afterend", positioner)
    })
  }

  seeFocusAfterTrigger = async () => {
    await expect.poll(() => getFocusPosition(this.trigger, { skip: "[data-select-positioner]" })).toBe("after")
  }

  seeFocusBeforeTrigger = async () => {
    await expect.poll(() => getFocusPosition(this.trigger, { skip: "[data-select-positioner]" })).toBe("before")
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
    await expect(this.list).toBeFocused()
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
    expect(await isInViewport(this.list, item)).toBe(true)
  }

  autofill = async (value: string) => {
    await this.page.evaluate((value) => {
      const select = document.querySelector<HTMLSelectElement>("[data-select-root] select[aria-hidden]")
      if (!select) throw new Error("Hidden select not found")
      select.value = value
      // browsers fire input then change on autofill
      select.dispatchEvent(new Event("input", { bubbles: true }))
      select.dispatchEvent(new Event("change", { bubbles: true }))
    }, value)
  }
}

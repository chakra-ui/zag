import { expect, type Page } from "@playwright/test"
import { a11y, isInViewport } from "../_utils"
import { Model } from "./model"

/** An item, addressed either by its visible label or by its exact value. */
type ItemRef = string | { value: string }

export class ListboxModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/listbox/basic") {
    return this.page.goto(url)
  }

  get label() {
    return this.page.locator("[data-scope=listbox][data-part=label]")
  }

  get input() {
    return this.page.locator("[data-scope=listbox][data-part=input]")
  }

  getItem = (item: ItemRef) => {
    // `hasText` is a substring match, so address by value where exact identity matters
    if (typeof item !== "string") {
      return this.page.locator(`[data-scope=listbox][data-part=item][data-value="${item.value}"]`)
    }
    return this.page.locator(`[data-scope=listbox][data-part=item]`, { hasText: item })
  }

  get content() {
    return this.page.locator("[data-scope=listbox][data-part=content]")
  }

  async tabToContent() {
    await this.page.click("main.listbox", { position: { x: 300, y: 30 }, force: true })
    await this.page.keyboard.press("Tab")
    await expect(this.content).toBeFocused()
  }

  typeSequentially(value: string) {
    return this.input.pressSequentially(value)
  }

  clickItem(item: ItemRef, options?: { modifiers?: Array<"Shift" | "ControlOrMeta"> }) {
    return this.getItem(item).click(options)
  }

  hoverItem(item: ItemRef) {
    return this.getItem(item).hover()
  }

  seeSelectedValues(values: string[]) {
    return expect
      .poll(() =>
        this.content
          .locator("[data-part=item][data-selected]")
          .evaluateAll((els) => els.map((el) => el.getAttribute("data-value"))),
      )
      .toEqual(values)
  }

  seeItemIsHighlighted(item: ItemRef) {
    return expect(this.getItem(item)).toHaveAttribute("data-highlighted", "")
  }

  seeNoItemIsHighlighted() {
    return expect(this.content.locator(`[data-highlighted]`).all()).toHaveLength(0)
  }

  seeItemIsSelected(item: ItemRef) {
    return expect(this.getItem(item)).toHaveAttribute("data-selected", "")
  }

  seeNoItemIsSelected() {
    return expect(this.content.locator(`[data-selected]`).all()).toHaveLength(0)
  }

  seeItemInViewport = async (ref: ItemRef) => {
    const item = this.getItem(ref)
    expect(await isInViewport(this.content, item)).toBe(true)
  }
}

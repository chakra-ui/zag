import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

/** A handle by position, or by its id such as "a:b" */
type HandleRef = number | string

export class SplitterModel extends Model {
  private dragStart = { x: 0, y: 0 }

  constructor(public page: Page) {
    super(page)
  }

  goto(example = "basic") {
    return this.page.goto(`/splitter/${example}`)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  get root() {
    return this.page.locator("[data-splitter-root]").first()
  }

  handle(ref: HandleRef) {
    if (typeof ref === "string") return this.page.locator(`[role="separator"][data-id="${ref}"]`)
    return this.page.getByRole("separator").nth(ref)
  }

  panel(index: number) {
    return this.page.locator("[data-splitter-panel]").nth(index)
  }

  /** The `<pre>` most examples print `api.getSizes()` into */
  async getSizes(): Promise<number[]> {
    const text = await this.page.locator("main pre").textContent()
    return JSON.parse(text!).map((size: number) => Math.round(size))
  }

  async seeSizes(sizes: number[]) {
    await expect.poll(() => this.getSizes()).toEqual(sizes)
  }

  async panelWidth(index: number) {
    const width = await this.panel(index).evaluate((el) => el.getBoundingClientRect().width)
    return Math.round(width)
  }

  panelWidths() {
    return this.page
      .locator("[data-splitter-panel]")
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)))
  }

  clickButton(name: string) {
    return this.page.getByRole("button", { name }).click()
  }

  private async handleCenter(ref: HandleRef) {
    const box = await this.handle(ref).boundingBox()
    if (!box) throw new Error(`Handle ${ref} is not visible`)
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  }

  async handleX(ref: HandleRef) {
    return (await this.handleCenter(ref)).x
  }

  /** Presses on a handle and moves `dx` pixels without releasing */
  async startDrag(ref: HandleRef, dx: number) {
    this.dragStart = await this.handleCenter(ref)
    await this.page.mouse.move(this.dragStart.x, this.dragStart.y)
    await this.page.mouse.down()
    await this.moveDrag(dx)
  }

  /** Moves an ongoing drag to `dx` pixels from where it started */
  async moveDrag(dx: number) {
    await this.page.mouse.move(this.dragStart.x + dx, this.dragStart.y, { steps: 4 })
  }

  /** Drags a handle by `dx` pixels in one gesture, optionally through `via` first */
  async drag(ref: HandleRef, dx: number, via?: number) {
    await this.startDrag(ref, via ?? dx)
    if (via != null) await this.moveDrag(dx)
    await this.page.mouse.up()
  }

  async dragVertically(ref: HandleRef, dy: number) {
    const { x, y } = await this.handleCenter(ref)
    await this.page.mouse.move(x, y)
    await this.page.mouse.down()
    await this.page.mouse.move(x, y + dy, { steps: 5 })
    await this.page.mouse.up()
  }

  async focusHandle(ref: HandleRef) {
    await this.handle(ref).focus()
  }

  hoverHandle(ref: HandleRef) {
    return this.handle(ref).hover()
  }

  doubleClickHandle(ref: HandleRef) {
    return this.handle(ref).dblclick()
  }

  /** Adds a focused button before the splitter, so Tab moves into it */
  async focusButtonBeforeSplitter() {
    await this.page.locator("main").evaluate((main) => {
      const button = document.createElement("button")
      button.textContent = "Before splitter"
      main.prepend(button)
      button.focus()
    })
  }

  async getHandleValue(ref: HandleRef) {
    return Number(await this.handle(ref).getAttribute("aria-valuenow"))
  }

  async seeHandleValue(ref: HandleRef, value: number) {
    await expect(this.handle(ref)).toHaveAttribute("aria-valuenow", String(value))
  }

  async seeHandleValueBelow(ref: HandleRef, value: number) {
    await expect.poll(() => this.getHandleValue(ref)).toBeLessThan(value)
  }

  async seeHandleMin(ref: HandleRef, value: number) {
    await expect(this.handle(ref)).toHaveAttribute("aria-valuemin", String(value))
  }

  /** Allows 2px for sub-pixel rounding */
  async seeHandleMovedBy(ref: HandleRef, startX: number, dx: number) {
    await expect.poll(async () => Math.abs((await this.handleX(ref)) - startX - dx)).toBeLessThanOrEqual(2)
  }

  async seeHandleIsFocused(ref: HandleRef) {
    await expect(this.handle(ref)).toBeFocused()
  }

  async dontSeeFocusRing(ref: HandleRef) {
    expect(await this.handle(ref).evaluate((el) => el.matches(":focus-visible"))).toBe(false)
  }

  async seeHandleIsDisabled(ref: HandleRef) {
    await expect(this.handle(ref)).toHaveAttribute("aria-disabled", "true")
    await expect(this.handle(ref)).not.toHaveAttribute("tabindex")
  }

  async seeHandleOrientation(ref: HandleRef, orientation: "horizontal" | "vertical") {
    await expect(this.handle(ref)).toHaveAttribute("aria-orientation", orientation)
  }

  /** The layout direction, shared by the root, panels and handles */
  async seeLayoutOrientation(orientation: "horizontal" | "vertical") {
    await expect(this.root).toHaveAttribute("data-orientation", orientation)
    await expect(this.panel(0)).toHaveAttribute("data-orientation", orientation)
    await expect(this.handle(0)).toHaveAttribute("data-orientation", orientation)
  }

  async seePanelWidth(index: number, width: number) {
    await expect.poll(() => this.panelWidth(index)).toBe(width)
  }

  async seePanelWidths(widths: number[]) {
    await expect.poll(() => this.panelWidths()).toEqual(widths)
  }

  openContextMenu() {
    return this.page.evaluate(() => document.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true })))
  }

  output(name: string) {
    return this.page.getByRole("status", { name })
  }

  seeOutput(name: string, text: string | RegExp) {
    return expect(this.output(name)).toHaveText(text)
  }

  /** Sizes from the events example's "Sizes" output */
  async getOutputSizes() {
    const text = await this.output("Sizes").textContent()
    return text!.split("/").map(Number)
  }
}

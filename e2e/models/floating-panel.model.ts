import { expect, type Page } from "@playwright/test"
import { a11y, rect } from "../_utils"
import { Model } from "./model"

const part = (p: string) => `[data-floating-panel-${p}]`

type Axis = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne"

export class FloatingPanelModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/floating-panel/basic") {
    return this.page.goto(url)
  }

  checkAccessibility() {
    return a11y(this.page, "[role=dialog]")
  }

  get trigger() {
    return this.page.locator(part("trigger"))
  }

  get content() {
    return this.page.locator(part("content"))
  }

  get dragTrigger() {
    return this.page.locator(part("drag-trigger"))
  }

  get minimizeTrigger() {
    return this.page.locator(`${part("stage-trigger")}[data-stage=minimized]`)
  }

  get maximizeTrigger() {
    return this.page.locator(`${part("stage-trigger")}[data-stage=maximized]`)
  }

  get restoreTrigger() {
    return this.page.locator(`${part("stage-trigger")}[data-stage=default]`)
  }

  get closeTrigger() {
    return this.page.locator(part("close-trigger"))
  }

  get body() {
    return this.page.locator(part("body"))
  }

  getResizeTrigger(axis: Axis) {
    return this.page.locator(`${part("resize-trigger")}[data-placement=${axis}]`)
  }

  clickTrigger() {
    return this.trigger.click()
  }

  clickMinimize() {
    return this.minimizeTrigger.click()
  }

  clickMaximize() {
    return this.maximizeTrigger.click()
  }

  clickRestore() {
    return this.restoreTrigger.click()
  }

  clickClose() {
    return this.closeTrigger.click()
  }

  doubleClickDragTrigger() {
    return this.dragTrigger.dblclick()
  }

  seeContent() {
    return expect(this.content).toBeVisible()
  }

  dontSeeContent() {
    return expect(this.content).not.toBeVisible()
  }

  seeBody() {
    return expect(this.body).toBeVisible()
  }

  dontSeeBody() {
    return expect(this.body).not.toBeVisible()
  }

  seeMinimized() {
    return expect(this.content).toHaveAttribute("data-minimized", "")
  }

  dontSeeMinimized() {
    return expect(this.content).not.toHaveAttribute("data-minimized")
  }

  seeMaximized() {
    return expect(this.content).toHaveAttribute("data-maximized", "")
  }

  dontSeeMaximized() {
    return expect(this.content).not.toHaveAttribute("data-maximized")
  }

  seeStaged() {
    return expect(this.content).toHaveAttribute("data-staged", "")
  }

  dontSeeStaged() {
    return expect(this.content).not.toHaveAttribute("data-staged")
  }

  async getContentSize() {
    return rect(this.content)
  }

  async seeContentHasSize(width: number, height: number, tolerance = 5) {
    const size = await this.getContentSize()
    expect(size.width).toBeCloseTo(width, -Math.log10(tolerance))
    expect(size.height).toBeCloseTo(height, -Math.log10(tolerance))
  }

  async seeContentHasPosition(x: number, y: number, tolerance = 5) {
    const content = await this.getContentSize()
    expect(content.x).toBeCloseTo(x, -Math.log10(tolerance))
    expect(content.y).toBeCloseTo(y, -Math.log10(tolerance))
  }

  async dragBy(offset: { x: number; y: number }) {
    const box = await rect(this.dragTrigger)
    await this.page.mouse.move(box.midX, box.midY)
    await this.page.mouse.down()
    await this.page.mouse.move(box.midX + offset.x, box.midY + offset.y, { steps: 10 })
    await this.page.mouse.up()
  }

  async resizeBy(axis: Axis, offset: { x: number; y: number }) {
    const trigger = this.getResizeTrigger(axis)
    const box = await rect(trigger)
    await this.page.mouse.move(box.midX, box.midY)
    await this.page.mouse.down()
    await this.page.mouse.move(box.midX + offset.x, box.midY + offset.y, { steps: 10 })
    await this.page.mouse.up()
  }

  seeTriggerIsFocused() {
    return expect(this.trigger).toBeFocused()
  }

  seeContentIsFocused() {
    return expect(this.content).toBeFocused()
  }
}

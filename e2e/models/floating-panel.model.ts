import { expect, type Page } from "@playwright/test"
import { a11y, rect } from "../_utils"
import { Model } from "./model"

const floatingPanel = (p: string) => `[data-scope=floating-panel][data-part=${p}]`

export class FloatingPanelModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/floating-panel") {
    return this.page.goto(url)
  }

  checkAccessibility() {
    return a11y(this.page, "[role=dialog]")
  }

  get trigger() {
    return this.page.locator(floatingPanel("trigger"))
  }

  get content() {
    return this.page.locator(floatingPanel("content"))
  }

  get dragTrigger() {
    return this.page.locator(floatingPanel("drag-trigger"))
  }

  get minimizeTrigger() {
    return this.page.locator(`${floatingPanel("stage-trigger")}[data-stage=minimized]`)
  }

  get maximizeTrigger() {
    return this.page.locator(`${floatingPanel("stage-trigger")}[data-stage=maximized]`)
  }

  get restoreTrigger() {
    return this.page.locator(`${floatingPanel("stage-trigger")}[data-stage=default]`)
  }

  get closeTrigger() {
    return this.page.locator(floatingPanel("close-trigger"))
  }

  get body() {
    return this.page.locator(floatingPanel("body"))
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

  seeTriggerIsFocused() {
    return expect(this.trigger).toBeFocused()
  }

  seeContentIsFocused() {
    return expect(this.content).toBeFocused()
  }
}

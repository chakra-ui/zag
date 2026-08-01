import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

export class SchedulerModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/scheduler/basic") {
    return this.page.goto(url)
  }

  checkAccessibility() {
    return a11y(this.page, "[data-scheduler-root]")
  }

  get root() {
    return this.page.locator("[data-scheduler-root]")
  }

  get grid() {
    return this.page.locator("[data-scheduler-grid]")
  }

  getDayColumnOf(id: string) {
    return this.page.locator(`[data-scheduler-day-column]:has([data-scheduler-event][data-event-id='${id}'])`)
  }

  get prevTrigger() {
    return this.page.locator("[data-scheduler-prev-trigger]")
  }

  get nextTrigger() {
    return this.page.locator("[data-scheduler-next-trigger]")
  }

  get todayTrigger() {
    return this.page.locator("[data-scheduler-today-trigger]")
  }

  get headerTitle() {
    return this.page.locator("[data-scheduler-header-title]")
  }

  getEvent(id: string) {
    return this.page.locator(`[data-scheduler-event][data-event-id='${id}']`)
  }

  clickPrev() {
    return this.prevTrigger.click()
  }

  clickNext() {
    return this.nextTrigger.click()
  }

  clickToday() {
    return this.todayTrigger.click()
  }

  clickEvent(id: string) {
    return this.getEvent(id).click()
  }

  // Short events are barely taller than the resize handle, so the centre would land on it and resize instead of drag.
  async getEventGrabPoint(id: string) {
    const box = await this.getEvent(id).boundingBox()
    if (!box) throw new Error(`Event ${id} not found`)
    const handleBox = await this.getResizeHandle(id).boundingBox()
    const bodyEnd = handleBox ? handleBox.y : box.y + box.height
    return { x: box.x + box.width / 2, y: (box.y + bodyEnd) / 2 }
  }

  async dragEvent(id: string, deltaX: number, deltaY: number) {
    const { x: startX, y: startY } = await this.getEventGrabPoint(id)
    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX + deltaX, startY + deltaY, { steps: 10 })
    await this.page.mouse.up()
  }

  getResizeHandle(id: string) {
    return this.page.locator(
      `[data-scheduler-event][data-event-id='${id}'] [data-scheduler-event-resize-handle][data-edge='end']`,
    )
  }

  async dragResizeHandle(id: string, deltaY: number) {
    const box = await this.getResizeHandle(id).boundingBox()
    if (!box) throw new Error(`Resize handle for ${id} not found`)
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2
    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX, startY + deltaY, { steps: 10 })
    await this.page.mouse.up()
  }

  seeView(view: string) {
    return expect(this.page.locator(`[data-scheduler-root][data-view='${view}']`)).toBeVisible()
  }

  seeEvent(id: string) {
    return expect(this.getEvent(id)).toBeVisible()
  }

  seeEventDragging(id: string) {
    return expect(this.getEvent(id)).toHaveAttribute("data-dragging", "")
  }

  seeEventResizing(id: string) {
    return expect(this.getEvent(id)).toHaveAttribute("data-resizing", "")
  }
}

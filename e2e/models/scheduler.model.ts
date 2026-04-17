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
    return a11y(this.page, "[data-part=root]")
  }

  get root() {
    return this.page.locator("[data-scope='scheduler'][data-part='root']")
  }

  get grid() {
    return this.page.locator("[data-scope='scheduler'][data-part='grid']")
  }

  get prevTrigger() {
    return this.page.locator("[data-scope='scheduler'][data-part='prev-trigger']")
  }

  get nextTrigger() {
    return this.page.locator("[data-scope='scheduler'][data-part='next-trigger']")
  }

  get todayTrigger() {
    return this.page.locator("[data-scope='scheduler'][data-part='today-trigger']")
  }

  get headerTitle() {
    return this.page.locator("[data-scope='scheduler'][data-part='header-title']")
  }

  getEvent(id: string) {
    return this.page.locator(`[data-scope='scheduler'][data-part='event'][data-event-id='${id}']`)
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

  async dragEvent(id: string, deltaX: number, deltaY: number) {
    const el = this.getEvent(id)
    const box = await el.boundingBox()
    if (!box) throw new Error(`Event ${id} not found`)
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2
    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX + deltaX, startY + deltaY, { steps: 10 })
    await this.page.mouse.up()
  }

  async dragResizeHandle(id: string, deltaY: number) {
    const handle = this.page.locator(
      `[data-scope='scheduler'][data-part='event'][data-event-id='${id}'] [data-part='event-resize-handle'][data-edge='end']`,
    )
    const box = await handle.boundingBox()
    if (!box) throw new Error(`Resize handle for ${id} not found`)
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2
    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX, startY + deltaY, { steps: 10 })
    await this.page.mouse.up()
  }

  seeView(view: string) {
    return expect(this.page.locator(`[data-scope='scheduler'][data-part='root'][data-view='${view}']`)).toBeVisible()
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

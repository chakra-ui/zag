import { expect, type Locator, type Page } from "@playwright/test"
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

  get viewSelect() {
    return this.page.locator("[data-scheduler-view-select]")
  }

  getViewItem(view: string) {
    return this.page.locator(`[data-scheduler-view-item][data-view='${view}']`)
  }

  selectLocale(locale: string) {
    return this.page.selectOption("[data-testid=locale]", locale)
  }

  selectTimeZone(zone: string) {
    return this.page.selectOption("[data-testid=zone]", zone)
  }

  /** Only the overlays actually on screen — every cell and column renders a hidden one. */
  get visibleDragPreviews() {
    return this.page.locator("[data-scheduler-drag-ghost]:not([hidden])")
  }

  get visibleDragOrigins() {
    return this.page.locator("[data-scheduler-drag-origin]:not([hidden])")
  }

  /** Preview chips in the all-day row, one per day the dragged range covers. */
  get allDayDragPreviews() {
    return this.page.locator("[data-scheduler-day-cell][data-all-day] [data-scheduler-drag-ghost]:not([hidden])")
  }

  get gridDragPreviews() {
    return this.page.locator("[data-scheduler-day-column] [data-scheduler-drag-ghost]:not([hidden])")
  }

  get gridDragOrigins() {
    return this.page.locator("[data-scheduler-day-column] [data-scheduler-drag-origin]:not([hidden])")
  }

  get allDayRow() {
    return this.page.locator("[data-scheduler-all-day-row]")
  }

  get allDayDropTarget() {
    return this.page.locator("[data-scheduler-day-cell][data-all-day][data-drop-target]")
  }

  /** The all-day cell an event currently sits in. */
  allDayCellOf(id: string) {
    return this.page.locator(`[data-scheduler-day-cell][data-all-day]:has([data-event-id='${id}'])`)
  }

  allDayCell(date: string) {
    return this.page.locator(`[data-scheduler-day-cell][data-all-day][data-date='${date}']`)
  }

  /** Presses on an event and moves to a point, leaving the button down. */
  private async startDrag(id: string, to: { x: number; y: number }) {
    const { x, y } = await this.getEventGrabPoint(id)
    await this.page.mouse.move(x, y)
    await this.page.mouse.down()
    await this.page.mouse.move(to.x, to.y, { steps: 10 })
  }

  /** Drags onto the all-day cell for `date` — viewport-independent, unlike a pixel delta. */
  async dragEventToAllDayCell(id: string, date: string, drop = true) {
    const box = await this.allDayCell(date).boundingBox()
    await this.startDrag(id, { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 })
    if (drop) await this.page.mouse.up()
  }

  /** Drags into the time grid, staying in the event's own column. */
  async dragEventIntoGrid(id: string) {
    const { x } = await this.getEventGrabPoint(id)
    const box = await this.grid.boundingBox()
    await this.startDrag(id, { x, y: box!.y + box!.height / 2 })
    await this.page.mouse.up()
  }

  /** Expanded instances of a recurring series, as `<id>:<n>`. */
  instanceIdsOf(baseId: string) {
    return this.page
      .locator(`[data-scheduler-event][data-event-id^='${baseId}:']`)
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-event-id")!))
  }

  /** The days a recurring series lands on, in column order. */
  instanceDaysOf(baseId: string) {
    return this.page
      .locator(`[data-scheduler-event][data-event-id^='${baseId}:']`)
      .evaluateAll((els) =>
        els.map((e) => e.closest("[data-scheduler-day-column]")!.getAttribute("data-date")!.slice(0, 10)).sort(),
      )
  }

  /** Native HTML5 drag from the backlog onto a target. The browser only permits the drop when
   *  `dragover` was prevented, so the return value reports whether the target accepted it. */
  async dragBacklogItemTo(id: string, target: Locator) {
    return target.evaluate((el, itemId) => {
      const item = document.querySelector(`[data-testid=backlog-${itemId}]`)!
      const dt = new DataTransfer()
      item.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer: dt }))
      dt.setData("text/plain", itemId)
      const over = new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt })
      el.dispatchEvent(over)
      el.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }))
      return over.defaultPrevented
    }, id)
  }

  get allDayMoreButtons() {
    return this.page.locator("[data-scheduler-day-cell][data-all-day] [data-scheduler-more-events]")
  }

  /** Levels the all-day row reports, which is what sizes it. */
  allDayRowLevels() {
    return this.allDayRow.evaluate((el) =>
      Number(getComputedStyle(el).getPropertyValue("--scheduler-all-day-rows").trim()),
    )
  }

  get allDayCells() {
    return this.page.locator("[data-scheduler-day-cell][data-all-day]")
  }

  get columnHeaders() {
    return this.page.locator("[data-scheduler-column-header]")
  }

  /** `[data-testid=today]` in the timezone example — today resolved against the selected zone. */
  get todayText() {
    return this.page.locator("[data-testid=today]")
  }

  /** `[data-testid=time-<id>]` in the timezone example — an event's formatted time. */
  getEventTime(id: string) {
    return this.page.locator(`[data-testid=time-${id}]`)
  }

  get events() {
    return this.page.locator("[data-scheduler-event]")
  }

  /** Unscheduled items in the external-drop example. */
  get backlogItems() {
    return this.page.locator("[data-testid=backlog] li")
  }

  getBacklogItem(id: string) {
    return this.page.locator(`[data-testid=backlog-${id}]`)
  }

  /** Callback log rendered by the resources and external-drop examples. */
  get dropLog() {
    return this.page.locator("[data-testid=drop-log]")
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
    const box = await this.getEvent(id).first().boundingBox()
    if (!box) throw new Error(`Event ${id} not found`)
    // boundingBox() waits for a missing locator, so only ask when a handle is rendered
    const handle = this.getResizeHandle(id).first()
    const handleBox = (await handle.count()) > 0 ? await handle.boundingBox() : null
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

  getResizeHandle(id: string, edge: "start" | "end" = "end") {
    return this.page.locator(
      `[data-scheduler-event][data-event-id='${id}'] [data-scheduler-event-resize-handle][data-edge='${edge}']`,
    )
  }

  /** Placement of an all-day bar: the cell it starts in, and how many cells wide it renders. */
  async barPlacement(id: string) {
    return this.getEvent(id)
      .first()
      .evaluate((el) => {
        const cell = el.closest("[data-scheduler-day-cell]")!
        const cells = [...cell.parentElement!.querySelectorAll("[data-scheduler-day-cell]")]
        return {
          column: cells.indexOf(cell),
          span: Math.round(el.getBoundingClientRect().width / cell.getBoundingClientRect().width),
        }
      })
  }

  /** All-day cells the event currently occupies, in order. */
  async allDaySpanOf(id: string) {
    return this.page
      .locator(`[data-scheduler-day-cell][data-all-day]:has([data-event-id='${id}'])`)
      .evaluateAll((cells) => cells.map((c) => c.getAttribute("data-date")!.slice(0, 10)))
  }

  /** Drags an all-day event's edge onto the cell for `date`, resizing it by whole days. */
  async resizeAllDayTo(id: string, edge: "start" | "end", date: string) {
    const handle = await this.getResizeHandle(id, edge).first().boundingBox()
    const cell = await this.allDayCell(date).boundingBox()
    await this.page.mouse.move(handle!.x + handle!.width / 2, handle!.y + handle!.height / 2)
    await this.page.mouse.down()
    await this.page.mouse.move(cell!.x + cell!.width / 2, cell!.y + cell!.height / 2, { steps: 10 })
    await this.page.mouse.up()
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

  // ---------------------------------------------------------------------------
  // Resources
  // ---------------------------------------------------------------------------

  get columns() {
    return this.page.locator("[data-scheduler-day-column]")
  }

  getResourceColumn(resourceId: string) {
    return this.page.locator(`[data-scheduler-day-column][data-resource='${resourceId}']`)
  }

  getResourceHeader(resourceId: string) {
    return this.page.locator(`[data-scheduler-column-header][data-resource='${resourceId}']`)
  }

  /** Events rendered inside one resource's column, rather than the whole grid. */
  getEventsInResource(resourceId: string) {
    return this.getResourceColumn(resourceId).locator("[data-scheduler-event]")
  }

  seeResourceColumns(resourceIds: string[]) {
    return expect(this.columns).toHaveAttribute("data-resource", new RegExp(resourceIds.join("|")))
  }

  seeResourceIsDisabled(resourceId: string) {
    return expect(this.getResourceColumn(resourceId)).toHaveAttribute("data-disabled", "")
  }

  /** Drag overlays that are rendered but hidden do not count as shown. */
  visibleDragOverlayResources() {
    return this.page.evaluate(() =>
      [...document.querySelectorAll("[data-scheduler-drag-ghost]")]
        .filter((el) => !el.hasAttribute("hidden"))
        .map((el) => el.closest("[data-scheduler-day-column]")?.getAttribute("data-resource") ?? ""),
    )
  }

  seeEventInResource(eventId: string, resourceId: string) {
    return expect(this.getResourceColumn(resourceId).locator(`[data-event-id='${eventId}']`)).toBeVisible()
  }

  // ---------------------------------------------------------------------------
  // Drop constraints
  // ---------------------------------------------------------------------------

  /** Drags without releasing, so the live `data-invalid` state can be asserted mid-gesture. */
  async dragEventTo(id: string, deltaX: number, deltaY: number) {
    const { x, y } = await this.getEventGrabPoint(id)
    await this.page.mouse.move(x, y)
    await this.page.mouse.down()
    await this.page.mouse.move(x + deltaX, y + deltaY, { steps: 10 })
  }

  releaseDrag() {
    return this.page.mouse.up()
  }

  seeEventIsInvalid(id: string) {
    return expect(this.getEvent(id)).toHaveAttribute("data-invalid", "")
  }

  seeEventIsValid(id: string) {
    return expect(this.getEvent(id)).not.toHaveAttribute("data-invalid", "")
  }

  seeDropLog(expected: string) {
    return expect(this.page.locator("[data-testid=drop-log]")).toHaveText(expected)
  }

  // ---------------------------------------------------------------------------
  // Timeline
  // ---------------------------------------------------------------------------

  get timeline() {
    return this.page.locator("[data-scheduler-timeline]")
  }

  get timelineRows() {
    return this.page.locator("[data-scheduler-timeline-row]")
  }

  get timelineSlots() {
    return this.page.locator("[data-scheduler-timeline-slot]")
  }

  getTimelineRow(resourceId: string) {
    return this.page.locator(`[data-scheduler-timeline-row][data-resource='${resourceId}']`)
  }

  getTimelineEvent(id: string) {
    return this.page.locator(`[data-scheduler-timeline-track] [data-event-id='${id}']`)
  }

  /**
   * HTML5 drag-and-drop cannot be driven by mouse events in Playwright, so the
   * dragstart/dragover/drop sequence is dispatched with a shared DataTransfer.
   */
  async dragBacklogItemToGrid(itemId: string, atFraction = 0.3) {
    await this.page.evaluate(
      ({ itemId, atFraction }) => {
        const source = document.querySelector(`[data-testid='backlog-${itemId}']`) as HTMLElement
        const column = document.querySelector("[data-scheduler-day-column]") as HTMLElement
        if (!source || !column) throw new Error("missing drag source or column")

        const dataTransfer = new DataTransfer()
        source.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer }))

        const box = column.getBoundingClientRect()
        const clientX = box.left + box.width / 2
        const clientY = box.top + box.height * atFraction
        const init = { bubbles: true, cancelable: true, dataTransfer, clientX, clientY }
        column.dispatchEvent(new DragEvent("dragover", init))
        column.dispatchEvent(new DragEvent("drop", init))
      },
      { itemId, atFraction },
    )
  }

  /** Fraction of the track an event covers — how a timeline encodes duration. */
  async getTimelineSpan(id: string) {
    const event = await this.getTimelineEvent(id).boundingBox()
    const track = await this.getTimelineEvent(id)
      .locator("xpath=ancestor::*[@data-scheduler-timeline-track][1]")
      .boundingBox()
    if (!event || !track) throw new Error(`Timeline event ${id} not found`)
    return { offset: (event.x - track.x) / track.width, size: event.width / track.width }
  }
}

import { test, expect } from "@playwright/test"
import { SchedulerModel } from "./models/scheduler.model"

let I: SchedulerModel

test.describe("scheduler", () => {
  test.beforeEach(async ({ page }) => {
    I = new SchedulerModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("[pointer] clicking next advances the date", async () => {
    const titleBefore = await I.headerTitle.textContent()
    await I.clickNext()
    const titleAfter = await I.headerTitle.textContent()
    expect(titleAfter).not.toEqual(titleBefore)
  })

  test("[pointer] clicking prev goes back", async () => {
    const titleBefore = await I.headerTitle.textContent()
    await I.clickNext()
    await I.clickPrev()
    const titleAfter = await I.headerTitle.textContent()
    expect(titleAfter).toEqual(titleBefore)
  })

  test("[pointer] clicking today resets date", async () => {
    await I.clickNext()
    await I.clickNext()
    await I.clickToday()
    await expect(I.headerTitle).toContainText("2026")
  })

  test("events are visible in the grid", async () => {
    await I.seeEvent("standup-wed")
    await I.seeEvent("lunch")
  })

  test("a three-deep overlap splits the column into thirds", async () => {
    const first = await I.getEvent("overlap-a").boundingBox()
    const last = await I.getEvent("overlap-c").boundingBox()
    const columnBox = await I.getDayColumnOf("overlap-a").boundingBox()
    if (!first || !last || !columnBox) throw new Error("Could not get bounding boxes")
    expect(first.width).toBeCloseTo(columnBox.width / 3, -1)
    expect(last.width).toBeCloseTo(columnBox.width / 3, -1)
  })

  test("an event crossing midnight appears on both days", async () => {
    await expect(I.getEvent("night-shift")).toHaveCount(2)
  })

  test("[pointer] dragging an event fires onEventDrop", async () => {
    const dropPromise = I.page.waitForEvent("console", (msg) => msg.text().startsWith("event dropped"))
    await I.dragEvent("lunch", 0, 60)
    await dropPromise
  })

  test("[pointer] resizing an event fires onEventResize", async () => {
    const resizePromise = I.page.waitForEvent("console", (msg) => msg.text().startsWith("event resized"))
    await I.dragResizeHandle("lunch", 30)
    await resizePromise
  })

  test("[keyboard] pressing Enter on an event fires onEventClick", async () => {
    const clickPromise = I.page.waitForEvent("console", (msg) => msg.text().startsWith("event clicked"))
    await I.getEvent("lunch").focus()
    await I.page.keyboard.press("Enter")
    await clickPromise
  })

  test("[keyboard] pressing Escape during drag cancels the drag", async () => {
    const { x, y } = await I.getEventGrabPoint("lunch")
    await I.page.mouse.move(x, y)
    await I.page.mouse.down()
    await I.page.mouse.move(x, y + 120, { steps: 5 })
    await I.seeEventDragging("lunch")
    await I.page.keyboard.press("Escape")
    await I.page.mouse.up()
    await expect(I.getEvent("lunch")).not.toHaveAttribute("data-dragging", "")
  })
})

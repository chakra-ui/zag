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
    await I.seeEvent("1")
    await I.seeEvent("2")
  })

  test("overlapping events each take ~50% width", async () => {
    const event1 = I.getEvent("1")
    const event4 = I.getEvent("4")
    const box1 = await event1.boundingBox()
    const box4 = await event4.boundingBox()
    const gridBox = await I.grid.boundingBox()
    if (!box1 || !box4 || !gridBox) throw new Error("Could not get bounding boxes")
    expect(box1.width).toBeCloseTo(gridBox.width / 2, -1)
    expect(box4.width).toBeCloseTo(gridBox.width / 2, -1)
  })

  test("[pointer] dragging an event fires onEventDrop", async () => {
    const dropPromise = I.page.waitForEvent("console", (msg) => msg.text().startsWith("event dropped"))
    await I.dragEvent("1", 0, 60)
    await dropPromise
  })

  test("[pointer] resizing an event fires onEventResize", async () => {
    const resizePromise = I.page.waitForEvent("console", (msg) => msg.text().startsWith("event resized"))
    await I.dragResizeHandle("2", 30)
    await resizePromise
  })

  test("[keyboard] pressing Enter on an event fires onEventClick", async () => {
    const clickPromise = I.page.waitForEvent("console", (msg) => msg.text().startsWith("event clicked"))
    await I.getEvent("1").focus()
    await I.page.keyboard.press("Enter")
    await clickPromise
  })

  test("[keyboard] pressing Escape during drag cancels the drag", async () => {
    const event1 = I.getEvent("1")
    const box = await event1.boundingBox()
    if (!box) throw new Error("Event 1 not found")
    await I.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await I.page.mouse.down()
    await I.page.mouse.move(box.x + box.width / 2, box.y + 120, { steps: 5 })
    await I.seeEventDragging("1")
    await I.page.keyboard.press("Escape")
    await I.page.mouse.up()
    await expect(I.getEvent("1")).not.toHaveAttribute("data-dragging", "")
  })
})

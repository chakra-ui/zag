import { expect, test } from "@playwright/test"
import { SchedulerModel } from "./models/scheduler.model"

let I: SchedulerModel

test.describe("scheduler / timeZone", () => {
  test.beforeEach(async ({ page }) => {
    I = new SchedulerModel(page)
    await I.goto("/scheduler/timezone")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("renders an event time for the selected zone", async () => {
    await expect(I.getEventTime("1")).not.toBeEmpty()
  })

  test("resolves today against the selected zone", async () => {
    await expect(I.todayText).toHaveText(/^\d{4}-\d{2}-\d{2}$/)
    await I.selectTimeZone("Asia/Tokyo")
    await expect(I.todayText).toHaveText(/^\d{4}-\d{2}-\d{2}$/)
  })

  test("event times are zoneless, so they read the same in every zone", async () => {
    const utc = await I.getEventTime("1").textContent()
    await I.selectTimeZone("Asia/Tokyo")
    await expect(I.getEventTime("1")).toHaveText(utc!)
  })
})

test.describe("scheduler / editable events", () => {
  test.beforeEach(async ({ page }) => {
    I = new SchedulerModel(page)
    await I.goto("/scheduler/editable-events")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("marks a disabled event", async () => {
    await expect(I.getEvent("locked")).toHaveAttribute("data-disabled", "")
  })

  test("reports a conflict on both overlapping events", async () => {
    await expect(I.getEvent("conflict-a")).toHaveAttribute("data-conflict", "")
    await expect(I.getEvent("conflict-b")).toHaveAttribute("data-conflict", "")
    // a non-overlapping event stays clean
    await expect(I.getEvent("movable")).not.toHaveAttribute("data-conflict", "")
  })

  test("[pointer] canDragEvent blocks dragging a disabled event", async () => {
    const before = await I.getEvent("locked").boundingBox()
    await I.dragEvent("locked", 0, 80)
    const after = await I.getEvent("locked").boundingBox()
    expect(after?.y).toBeCloseTo(before!.y, 0)
  })

  test("[pointer] canResizeEvent blocks resizing a fixed-length event", async () => {
    const before = await I.getEvent("fixed-length").boundingBox()
    await I.dragResizeHandle("fixed-length", 60)
    const after = await I.getEvent("fixed-length").boundingBox()
    expect(after?.height).toBeCloseTo(before!.height, 0)
  })

  test("[pointer] an editable event still moves", async () => {
    const before = await I.getEvent("movable").boundingBox()
    await I.dragEvent("movable", 0, 80)
    const after = await I.getEvent("movable").boundingBox()
    expect(after!.y).toBeGreaterThan(before!.y)
  })
})

test.describe("scheduler / i18n", () => {
  test.beforeEach(async ({ page }) => {
    I = new SchedulerModel(page)
    await I.goto("/scheduler/i18n")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("translations reach the trigger labels", async () => {
    await expect(I.prevTrigger).toHaveAttribute("aria-label", "Previous")
    await I.selectLocale("de-DE")
    await expect(I.prevTrigger).toHaveAttribute("aria-label", "Zurück")
  })

  test("viewText drives the view item labels", async () => {
    await expect(I.getViewItem("week")).toHaveText("Week")
    await I.selectLocale("de-DE")
    await expect(I.getViewItem("week")).toHaveText("Woche")
  })

  test("viewSelectLabel is translated", async () => {
    await expect(I.viewSelect).toHaveAttribute("aria-label", "Calendar view")
    await I.selectLocale("de-DE")
    await expect(I.viewSelect).toHaveAttribute("aria-label", "Kalenderansicht")
  })

  test("an rtl locale flips the root direction", async () => {
    await expect(I.root).toHaveAttribute("dir", "ltr")
    await I.selectLocale("ar-EG")
    await expect(I.root).toHaveAttribute("dir", "rtl")
  })

  test("the locale drives the weekday labels", async () => {
    const en = await I.columnHeaders.first().textContent()
    await I.selectLocale("de-DE")
    await expect(I.columnHeaders.first()).not.toHaveText(en!)
  })
})

test.describe("scheduler / all-day", () => {
  test.beforeEach(async ({ page }) => {
    I = new SchedulerModel(page)
    await I.goto("/scheduler/all-day")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("a multi-day event renders as one bar, not one chip per day", async () => {
    await I.clickPrev()
    // DevConf runs Sep 11 -> Sep 13, clipped by the Sep 6-12 week
    await expect(I.getEvent("conf")).toHaveCount(1)
    expect(await I.barPlacement("conf")).toEqual({ column: 5, span: 2 })
    await expect(I.getEvent("conf")).toHaveAttribute("data-clip-end", "")
  })

  test("a clipped end carries no resize handle", async () => {
    await I.clickPrev()
    await expect(I.getResizeHandle("conf", "start")).toHaveCount(1)
    await expect(I.getResizeHandle("conf", "end")).toHaveCount(0)
  })

  test("[pointer] dragging moves the bar by whole days", async () => {
    expect(await I.barPlacement("holiday")).toEqual({ column: 1, span: 1 })
    await I.dragEventToAllDayCell("holiday", "2026-09-16T00:00:00")
    await expect(I.dropLog).toHaveText("holiday allDay:true 2026-09-16T00:00:00 → 2026-09-16T00:00:00 Δ2d0m")
    expect(await I.barPlacement("holiday")).toEqual({ column: 3, span: 1 })
  })

  test("[pointer] the bar itself tracks the pointer, with no overlay in the time grid", async () => {
    await I.dragEventToAllDayCell("holiday", "2026-09-15T00:00:00", false)
    expect(await I.barPlacement("holiday")).toEqual({ column: 2, span: 1 })
    await expect(I.gridDragPreviews).toHaveCount(0)
    await expect(I.gridDragOrigins).toHaveCount(0)
    await I.page.mouse.up()
  })

  test("[pointer] the dragged bar stays visible — it is its own preview", async () => {
    await I.dragEventToAllDayCell("holiday", "2026-09-16T00:00:00", false)
    const bar = I.getEvent("holiday").first()
    await expect(bar).toBeVisible()
    await expect(bar).toHaveText("Company holiday")
    expect(await bar.evaluate((el) => getComputedStyle(el).opacity)).toBe("1")
    await I.page.mouse.up()
  })

  test("[pointer] the drag never resizes the all-day row", async () => {
    const before = await I.allDayRow.boundingBox()
    await I.dragEventToAllDayCell("holiday", "2026-09-17T00:00:00", false)
    expect((await I.allDayRow.boundingBox())!.height).toBe(before!.height)
    await I.page.mouse.up()
  })

  test("[pointer] resizing the end extends the bar by whole days", async () => {
    await I.resizeAllDayTo("holiday", "end", "2026-09-17T00:00:00")
    expect(await I.barPlacement("holiday")).toEqual({ column: 1, span: 4 })
  })

  test("[pointer] resizing the start pulls the bar forward", async () => {
    await I.resizeAllDayTo("holiday", "end", "2026-09-17T00:00:00")
    await I.resizeAllDayTo("holiday", "start", "2026-09-16T00:00:00")
    expect(await I.barPlacement("holiday")).toEqual({ column: 3, span: 2 })
  })

  test("[pointer] an edge dragged past the other clamps to a single day", async () => {
    await I.resizeAllDayTo("holiday", "end", "2026-09-17T00:00:00")
    // `end` is inclusive, so one day is the floor rather than an inverted range
    await I.resizeAllDayTo("holiday", "end", "2026-09-13T00:00:00")
    expect(await I.barPlacement("holiday")).toEqual({ column: 1, span: 1 })
  })

  test("[pointer] dropping an all-day event in the grid reports a timed drop", async () => {
    await I.dragEventIntoGrid("holiday")
    await expect(I.dropLog).toContainText("allDay:false")
    const [, from, to] = (await I.dropLog.textContent())!.match(/T(\d{2}:\d{2}):00 → \S*T(\d{2}:\d{2}):00/)!
    const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
    expect(mins(to) - mins(from)).toBe(60)
  })

  test("[pointer] dropping a timed event in the all-day row reports an all-day drop", async () => {
    await I.clickPrev()
    await I.dragEventToAllDayCell("standup", "2026-09-10T00:00:00")
    await expect(I.dropLog).toHaveText("standup allDay:true 2026-09-10T00:00:00 → 2026-09-10T00:00:00 Δ0d-540m")
  })
})

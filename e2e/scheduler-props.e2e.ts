import { expect, test } from "@playwright/test"
import { schedulerAnchor } from "@zag-js/shared"
import { SchedulerModel } from "./models/scheduler.model"

/** The anchor is a Wednesday, so its week runs Sun -2 … Sat +3. */
const anchorDay = (offset: number) => schedulerAnchor.add({ days: offset }).toString()
/** Column index of an anchor-relative day within the anchor week. */
const anchorColumn = (offset: number) => offset + 3

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
    // `offsite` runs anchor+1 -> anchor+3, wholly inside the anchor week
    await expect(I.getEvent("offsite")).toHaveCount(1)
    expect(await I.barPlacement("offsite")).toEqual({ column: anchorColumn(1), span: 3 })
    await expect(I.getEvent("offsite")).not.toHaveAttribute("data-clip-end", "")
  })

  test("a bar clipped by the range carries no handle on that end", async () => {
    // `conference` runs anchor+4 -> anchor+8, so the week cuts it short
    await I.clickNext()
    await expect(I.getEvent("conference")).toHaveAttribute("data-clip-start", "")
    await expect(I.getResizeHandle("conference", "start")).toHaveCount(0)
    await expect(I.getResizeHandle("conference", "end")).toHaveCount(1)
  })

  test("[pointer] dragging moves the bar by whole days", async () => {
    expect(await I.barPlacement("holiday")).toEqual({ column: anchorColumn(0), span: 1 })
    await I.dragEventToAllDayCell("holiday", anchorDay(2))
    await expect(I.dropLog).toHaveText(`holiday allDay:true ${anchorDay(2)} → ${anchorDay(2)} Δ2d0m`)
    expect(await I.barPlacement("holiday")).toEqual({ column: anchorColumn(2), span: 1 })
  })

  test("[pointer] the bar itself tracks the pointer, with no overlay in the time grid", async () => {
    await I.dragEventToAllDayCell("holiday", anchorDay(1), false)
    expect(await I.barPlacement("holiday")).toEqual({ column: anchorColumn(1), span: 1 })
    await expect(I.gridDragPreviews).toHaveCount(0)
    await expect(I.gridDragOrigins).toHaveCount(0)
    await I.page.mouse.up()
  })

  test("[pointer] the dragged bar stays visible — it is its own preview", async () => {
    await I.dragEventToAllDayCell("holiday", anchorDay(2), false)
    const bar = I.getEvent("holiday").first()
    await expect(bar).toBeVisible()
    await expect(bar).toHaveText("Company holiday")
    expect(await bar.evaluate((el) => getComputedStyle(el).opacity)).toBe("1")
    await I.page.mouse.up()
  })

  test("[pointer] no bar escapes the row, at rest or mid-drag", async () => {
    // the row is free to deepen when a drag stacks another bar; what it must never do is let one
    // spill into the time grid below
    const escapes = async () => {
      const row = await I.allDayRow.boundingBox()
      const lowest = await I.page
        .locator("[data-scheduler-event][data-all-day]")
        .evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().bottom)))
      return lowest > row!.y + row!.height
    }

    expect(await escapes()).toBe(false)
    await I.dragEventToAllDayCell("holiday", anchorDay(3), false)
    expect(await escapes()).toBe(false)
    await I.page.mouse.up()
  })

  test("[pointer] resizing the end extends the bar by whole days", async () => {
    await I.resizeAllDayTo("holiday", "end", anchorDay(3))
    expect(await I.barPlacement("holiday")).toEqual({ column: anchorColumn(0), span: 4 })
  })

  test("[pointer] resizing the start pulls the bar forward", async () => {
    await I.resizeAllDayTo("holiday", "end", anchorDay(3))
    await I.resizeAllDayTo("holiday", "start", anchorDay(2))
    expect(await I.barPlacement("holiday")).toEqual({ column: anchorColumn(2), span: 2 })
  })

  test("[pointer] an edge dragged past the other clamps to a single day", async () => {
    await I.resizeAllDayTo("holiday", "end", anchorDay(3))
    // `end` is inclusive, so one day is the floor rather than an inverted range
    await I.resizeAllDayTo("holiday", "end", anchorDay(-2))
    expect(await I.barPlacement("holiday")).toEqual({ column: anchorColumn(0), span: 1 })
  })

  test("[pointer] dropping an all-day event in the grid reports a timed drop", async () => {
    await I.dragEventIntoGrid("holiday")
    await expect(I.dropLog).toContainText("allDay:false")
    const [, from, to] = (await I.dropLog.textContent())!.match(/T(\d{2}:\d{2}):00 → \S*T(\d{2}:\d{2}):00/)!
    const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
    expect(mins(to) - mins(from)).toBe(60)
  })

  test("[pointer] dropping a timed event in the all-day row reports an all-day drop", async () => {
    await I.dragEventToAllDayCell("standup-wed", anchorDay(0))
    await expect(I.dropLog).toHaveText(`standup-wed allDay:true ${anchorDay(0)} → ${anchorDay(0)} Δ0d-540m`)
  })

  test("the all-day row grows to fit the stacked bars", async () => {
    // `offsite` and `conference` overlap in the anchor week, so the row needs two levels
    expect(await I.allDayRowLevels()).toBe(2)
    const row = await I.allDayRow.boundingBox()
    const lowest = await I.page
      .locator("[data-scheduler-event][data-all-day]")
      .evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().bottom)))
    // a bar escaping the row would spill into the time grid below
    expect(lowest).toBeLessThanOrEqual(row!.y + row!.height)
  })

  test("[pointer] capping the rows collapses the rest into per-day counts", async () => {
    await I.page.getByTestId("cap-rows").check()

    expect(await I.allDayRowLevels()).toBe(1)
    await expect(I.allDayMoreButtons).toHaveCount(2)
    await expect(I.allDayMoreButtons.first()).toHaveText("+1 more")
  })
})

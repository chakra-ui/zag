import { expect, test } from "@playwright/test"
import { SchedulerModel } from "./models/scheduler.model"

let I: SchedulerModel

test.describe("scheduler / timeline", () => {
  test.beforeEach(async ({ page }) => {
    I = new SchedulerModel(page)
    await I.goto("/scheduler/timeline")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("renders one lane per resource and one slot per day", async () => {
    await expect(I.timelineRows).toHaveCount(3)
    await expect(I.timelineSlots).toHaveCount(7)
    await expect(I.getTimelineRow("studio-a")).toBeVisible()
  })

  test("scopes each event to its resource lane", async () => {
    await expect(I.getTimelineRow("studio-a").locator("[data-event-id='1']")).toBeVisible()
    await expect(I.getTimelineRow("studio-b").locator("[data-event-id='2']")).toBeVisible()
    await expect(I.getTimelineRow("studio-a").locator("[data-event-id='2']")).toHaveCount(0)
  })

  test("a multi-day event spans proportionally to its duration", async () => {
    // "Maintenance" runs Thu 08:00 -> Sat 12:00 across a 7 day range
    const span = await I.getTimelineSpan("3")
    expect(span.size).toBeGreaterThan(1 / 7)
    expect(span.size).toBeLessThan(3 / 7)
    // and it starts in the back half of the week
    expect(span.offset).toBeGreaterThan(0.5)
  })

  test("a shorter event spans less than a longer one", async () => {
    const mixing = await I.getTimelineSpan("2")
    const maintenance = await I.getTimelineSpan("3")
    expect(mixing.size).toBeLessThan(maintenance.size)
  })

  test("[pointer] next and prev move the range by a week", async () => {
    const before = await I.headerTitle.textContent()
    await I.clickNext()
    expect(await I.headerTitle.textContent()).not.toEqual(before)
    await I.clickPrev()
    expect(await I.headerTitle.textContent()).toEqual(before)
  })
})

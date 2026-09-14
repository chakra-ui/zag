import { expect, test } from "@playwright/test"
import { schedulerAnchor } from "@zag-js/shared"
import { SchedulerModel } from "./models/scheduler.model"

let I: SchedulerModel

const anchorDay = (offset: number) => schedulerAnchor.add({ days: offset }).toString().slice(0, 10)

test.describe("scheduler / recurring", () => {
  test.beforeEach(async ({ page }) => {
    I = new SchedulerModel(page)
    await I.goto("/scheduler/recurring")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("FREQ=DAILY expands to one instance per day through the range", async () => {
    // the series starts on the anchor, so it covers the anchor through the last visible day
    expect(await I.instanceDaysOf("daily")).toEqual([anchorDay(0), anchorDay(1), anchorDay(2), anchorDay(3)])
  })

  test("BYDAY expands only on the listed weekdays", async () => {
    // MWF from a Wednesday anchor: Wed and Fri fall inside the week, Mon is before the series
    expect(await I.instanceDaysOf("mwf")).toEqual([anchorDay(0), anchorDay(2)])
  })

  test("INTERVAL=2 skips the off weeks", async () => {
    expect(await I.instanceDaysOf("biweekly-tue")).toEqual([anchorDay(-1)])
  })

  test("every instance of a series carries a distinct id", async () => {
    const ids = await I.instanceIdsOf("daily")
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^daily:\d+$/)
  })

  test("[pointer] navigating forward re-expands the series", async () => {
    const before = await I.instanceDaysOf("daily")
    await I.clickNext()
    const after = await I.instanceDaysOf("daily")
    expect(after).not.toEqual(before)
    // COUNT=10 from the anchor, so the tail lands in the following week
    expect(after.length).toBeGreaterThan(0)
  })
})

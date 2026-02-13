import { CalendarDate } from "@internationalized/date"
import { getWeekOfYear } from "../src"

describe("getWeekOfYear", () => {
  it("returns 1 for Jan 4 (always in week 1 per ISO 8601)", () => {
    expect(getWeekOfYear(new CalendarDate(2023, 1, 4), "en")).toBe(1)
    expect(getWeekOfYear(new CalendarDate(2024, 1, 4), "en")).toBe(1)
  })

  it("returns week 1 for a date in the first week of the year", () => {
    expect(getWeekOfYear(new CalendarDate(2023, 1, 2), "en")).toBe(1)
  })

  it("returns 52 or 53 for last days of December", () => {
    const week52Or53 = getWeekOfYear(new CalendarDate(2023, 12, 31), "en")
    expect(week52Or53).toBeGreaterThanOrEqual(52)
    expect(week52Or53).toBeLessThanOrEqual(53)
  })
})

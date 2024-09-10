import { CalendarDate } from "@internationalized/date"
import { describe, expect, it } from "vitest"
import { getWeekDays } from "../src"

function exec(locale: string, weekStartDay?: number) {
  const today = new CalendarDate(2024, 8, 21)
  const days = getWeekDays(today, weekStartDay, "UTC", locale)
  // console.log(days.map((d) => `${d.long} ${d.value.day}`).join(","))
  return days[0].value.day
}

describe("getStartOfWeek", () => {
  it("en locale", () => {
    expect(exec("en")).toBe(18)
    expect(exec("en", 0)).toBe(18)
    expect(exec("en", 1)).toBe(19)
  })

  it("fr locale", () => {
    expect(exec("fr")).toBe(19)
    expect(exec("fr", 0)).toBe(19)
    expect(exec("fr", 1)).toBe(20)
  })
})

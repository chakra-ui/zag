import { CalendarDate } from "@internationalized/date"
import { describe, expect, it } from "vitest"
import { getEndOfWeek, getStartOfWeek, getWeekDays } from "../../src/date"

function exec(locale: string, weekStartDay?: number) {
  const today = new CalendarDate(2024, 8, 21)
  const days = getWeekDays(today, weekStartDay, "UTC", locale)
  // console.log(days.map((d) => `${d.short} ${d.value.day}`).join(","))
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
    expect(exec("fr", 0)).toBe(18)
    expect(exec("fr", 1)).toBe(19)
    expect(exec("fr", 2)).toBe(20)
  })
})

describe("getEndOfWeek", () => {
  it("follows the locale's first day like getStartOfWeek", () => {
    const date = new CalendarDate(2024, 8, 21)
    expect(getStartOfWeek(date, "de-DE").day).toBe(19)
    expect(getEndOfWeek(date, "de-DE").day).toBe(25)
    expect(getEndOfWeek(date, "en-US").day).toBe(24)
    expect(getEndOfWeek(date, "en-US", 1).day).toBe(25)
  })
})

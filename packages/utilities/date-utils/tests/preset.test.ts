import { CalendarDate } from "@internationalized/date"
import { describe, expect, test, vi } from "vitest"
import { getDateRangePreset } from "../src"

describe("getDateRangePreset", () => {
  const locale = "en-US"
  const timeZone = "UTC"

  const mockToday = (year: number, month: number, day: number) => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.UTC(year, month - 1, day, 12, 0, 0))
    return new CalendarDate(year, month, day)
  }

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("thisQuarter", () => {
    test("Q1 (January)", () => {
      mockToday(2024, 1, 15)
      const [start, end] = getDateRangePreset("thisQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-01-01")
      expect(end.toString()).toBe("2024-01-15")
    })

    test("Q1 (February)", () => {
      mockToday(2024, 2, 20)
      const [start, end] = getDateRangePreset("thisQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-01-01")
      expect(end.toString()).toBe("2024-02-20")
    })

    test("Q1 (March)", () => {
      mockToday(2024, 3, 31)
      const [start, end] = getDateRangePreset("thisQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-01-01")
      expect(end.toString()).toBe("2024-03-31")
    })

    test("Q2 (April)", () => {
      mockToday(2024, 4, 10)
      const [start, end] = getDateRangePreset("thisQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-04-01")
      expect(end.toString()).toBe("2024-04-10")
    })

    test("Q2 (June)", () => {
      mockToday(2024, 6, 30)
      const [start, end] = getDateRangePreset("thisQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-04-01")
      expect(end.toString()).toBe("2024-06-30")
    })

    test("Q3 (July)", () => {
      mockToday(2024, 7, 1)
      const [start, end] = getDateRangePreset("thisQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-07-01")
      expect(end.toString()).toBe("2024-07-01")
    })

    test("Q3 (September)", () => {
      mockToday(2024, 9, 15)
      const [start, end] = getDateRangePreset("thisQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-07-01")
      expect(end.toString()).toBe("2024-09-15")
    })

    test("Q4 (October)", () => {
      mockToday(2024, 10, 5)
      const [start, end] = getDateRangePreset("thisQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-10-01")
      expect(end.toString()).toBe("2024-10-05")
    })

    test("Q4 (December)", () => {
      mockToday(2024, 12, 31)
      const [start, end] = getDateRangePreset("thisQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-10-01")
      expect(end.toString()).toBe("2024-12-31")
    })
  })

  describe("lastQuarter", () => {
    test("Q1 → Q4 previous year", () => {
      mockToday(2024, 2, 15)
      const [start, end] = getDateRangePreset("lastQuarter", locale, timeZone)
      expect(start.toString()).toBe("2023-10-01")
      expect(end.toString()).toBe("2023-12-31")
    })

    test("Q2 → Q1", () => {
      mockToday(2024, 5, 20)
      const [start, end] = getDateRangePreset("lastQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-01-01")
      expect(end.toString()).toBe("2024-03-31")
    })

    test("Q3 → Q2", () => {
      mockToday(2024, 8, 10)
      const [start, end] = getDateRangePreset("lastQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-04-01")
      expect(end.toString()).toBe("2024-06-30")
    })

    test("Q4 → Q3", () => {
      mockToday(2024, 11, 25)
      const [start, end] = getDateRangePreset("lastQuarter", locale, timeZone)
      expect(start.toString()).toBe("2024-07-01")
      expect(end.toString()).toBe("2024-09-30")
    })
  })

  describe("other presets", () => {
    test("thisWeek", () => {
      mockToday(2024, 3, 14)
      const [start, end] = getDateRangePreset("thisWeek", locale, timeZone)
      expect(start.toString()).toBe("2024-03-10")
      expect(end.toString()).toBe("2024-03-16")
    })

    test("thisMonth", () => {
      mockToday(2024, 3, 15)
      const [start, end] = getDateRangePreset("thisMonth", locale, timeZone)
      expect(start.toString()).toBe("2024-03-01")
      expect(end.toString()).toBe("2024-03-15")
    })

    test("thisYear", () => {
      mockToday(2024, 6, 15)
      const [start, end] = getDateRangePreset("thisYear", locale, timeZone)
      expect(start.toString()).toBe("2024-01-01")
      expect(end.toString()).toBe("2024-06-15")
    })

    test("last7Days", () => {
      mockToday(2024, 3, 15)
      const [start, end] = getDateRangePreset("last7Days", locale, timeZone)
      expect(start.toString()).toBe("2024-03-09")
      expect(end.toString()).toBe("2024-03-15")
    })

    test("last30Days", () => {
      mockToday(2024, 3, 15)
      const [start, end] = getDateRangePreset("last30Days", locale, timeZone)
      expect(start.toString()).toBe("2024-02-15")
      expect(end.toString()).toBe("2024-03-15")
    })

    test("lastMonth", () => {
      mockToday(2024, 3, 15)
      const [start, end] = getDateRangePreset("lastMonth", locale, timeZone)
      expect(start.toString()).toBe("2024-02-01")
      expect(end.toString()).toBe("2024-02-29")
    })

    test("lastWeek", () => {
      mockToday(2024, 3, 14)
      const [start, end] = getDateRangePreset("lastWeek", locale, timeZone)
      expect(start.toString()).toBe("2024-03-03")
      expect(end.toString()).toBe("2024-03-09")
    })

    test("lastYear", () => {
      mockToday(2024, 3, 15)
      const [start, end] = getDateRangePreset("lastYear", locale, timeZone)
      expect(start.toString()).toBe("2023-01-01")
      expect(end.toString()).toBe("2023-12-31")
    })
  })

  test("invalid preset throws error", () => {
    mockToday(2024, 3, 15)
    expect(() => getDateRangePreset("invalidPreset" as any, locale, timeZone)).toThrow(
      "Invalid date range preset: invalidPreset",
    )
  })
})

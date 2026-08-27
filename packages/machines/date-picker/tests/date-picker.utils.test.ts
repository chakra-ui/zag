import { parseDate } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import type { DayTableCellState } from "../src/date-picker.types"
import {
  adjustStartAndEndDate,
  defaultTranslations,
  getNextView,
  getVisibleRangeText,
  isDateWithinRange,
  sortDates,
} from "../src/date-picker.utils"

function createDayCellState(overrides: Partial<DayTableCellState> = {}): DayTableCellState {
  return {
    focused: false,
    selectable: true,
    selected: false,
    valueText: "June 15, 2024",
    inRange: false,
    firstInRange: false,
    lastInRange: false,
    inHoveredRange: false,
    firstInHoveredRange: false,
    lastInHoveredRange: false,
    value: parseDate("2024-06-15"),
    outsideRange: false,
    disabled: false,
    invalid: false,
    unavailable: false,
    today: false,
    weekend: false,
    ...overrides,
  }
}

describe("DatePicker Utils", () => {
  describe("sortDates", () => {
    test("should sort dates in ascending order", () => {
      const date1 = parseDate("2024-01-15")
      const date2 = parseDate("2024-01-20")
      const date3 = parseDate("2024-01-10")
      const values = [date1, date2, date3]

      const sorted = sortDates(values)
      expect(sorted[0]).toEqual(date3)
      expect(sorted[1]).toEqual(date1)
      expect(sorted[2]).toEqual(date2)
    })

    test("should filter out null values and sort remaining dates", () => {
      const date1 = parseDate("2024-01-15")
      const date2 = parseDate("2024-01-20")
      const values = [date1, null, date2, null]

      const sorted = sortDates(values)
      expect(sorted).toHaveLength(2)
      expect(sorted[0]).toEqual(date1)
      expect(sorted[1]).toEqual(date2)
    })

    test("should return empty array when all values are null", () => {
      const values = [null, null, null]
      const sorted = sortDates(values)
      expect(sorted).toEqual([])
    })

    test("should filter out undefined values and sort remaining dates", () => {
      const date1 = parseDate("2024-01-15")
      const date2 = parseDate("2024-01-20")
      const values = [date1, undefined, date2, undefined]

      const sorted = sortDates(values)
      expect(sorted).toHaveLength(2)
      expect(sorted[0]).toEqual(date1)
      expect(sorted[1]).toEqual(date2)
    })

    test("should not mutate the original array", () => {
      const date1 = parseDate("2024-01-15")
      const date2 = parseDate("2024-01-20")
      const values = [date2, date1]
      const original = [...values]

      sortDates(values)
      expect(values).toEqual(original)
    })
  })

  describe("adjustStartAndEndDate", () => {
    test("should return value as-is when dates are already in order", () => {
      const startDate = parseDate("2024-01-10")
      const endDate = parseDate("2024-01-20")
      const value = [startDate, endDate]

      const result = adjustStartAndEndDate(value)
      expect(result).toEqual([startDate, endDate])
    })

    test("should swap dates when end date is before start date", () => {
      const startDate = parseDate("2024-01-20")
      const endDate = parseDate("2024-01-10")
      const value = [startDate, endDate]

      const result = adjustStartAndEndDate(value)
      expect(result).toEqual([endDate, startDate])
    })

    test("should return value as-is when start date is null", () => {
      const endDate = parseDate("2024-01-20")
      const value = [null, endDate]

      const result = adjustStartAndEndDate(value)
      expect(result).toEqual([null, endDate])
    })

    test("should return value as-is when end date is null", () => {
      const startDate = parseDate("2024-01-10")
      const value = [startDate, null]

      const result = adjustStartAndEndDate(value)
      expect(result).toEqual([startDate, null])
    })

    test("should return value as-is when both dates are null", () => {
      const value = [null, null]
      const result = adjustStartAndEndDate(value)
      expect(result).toEqual([null, null])
    })
  })

  describe("isDateWithinRange", () => {
    test("should return true when date is within range", () => {
      const startDate = parseDate("2024-01-10")
      const endDate = parseDate("2024-01-20")
      const date = parseDate("2024-01-15")
      const value = [startDate, endDate]

      expect(isDateWithinRange(date, value)).toBe(true)
    })

    test("should return false when date is before start date", () => {
      const startDate = parseDate("2024-01-10")
      const endDate = parseDate("2024-01-20")
      const date = parseDate("2024-01-05")
      const value = [startDate, endDate]

      expect(isDateWithinRange(date, value)).toBe(false)
    })

    test("should return false when date is after end date", () => {
      const startDate = parseDate("2024-01-10")
      const endDate = parseDate("2024-01-20")
      const date = parseDate("2024-01-25")
      const value = [startDate, endDate]

      expect(isDateWithinRange(date, value)).toBe(false)
    })

    test("should return false when start date is null", () => {
      const endDate = parseDate("2024-01-20")
      const date = parseDate("2024-01-15")
      const value = [null, endDate]

      expect(isDateWithinRange(date, value)).toBe(false)
    })

    test("should return false when end date is null", () => {
      const startDate = parseDate("2024-01-10")
      const date = parseDate("2024-01-15")
      const value = [startDate, null]

      expect(isDateWithinRange(date, value)).toBe(false)
    })

    test("should return false when both dates are null", () => {
      const date = parseDate("2024-01-15")
      const value = [null, null]

      expect(isDateWithinRange(date, value)).toBe(false)
    })
  })

  describe("getNextView", () => {
    test("should go from day to month", () => {
      expect(getNextView("day", "day", "year")).toBe("month")
    })

    test("should go from month to year", () => {
      expect(getNextView("month", "day", "year")).toBe("year")
    })

    test("should stay at year when already at maxView", () => {
      expect(getNextView("year", "day", "year")).toBe("year")
    })

    test("should stay at maxView when constrained below the default", () => {
      expect(getNextView("month", "month", "month")).toBe("month")
    })
  })

  describe("defaultTranslations.viewTrigger", () => {
    test("should describe switching to the resolved next view", () => {
      expect(defaultTranslations.viewTrigger("day", "month")).toBe("Switch to month view")
      expect(defaultTranslations.viewTrigger("month", "year")).toBe("Switch to year view")
    })

    test("should fall back to naming the current view when there is no next view", () => {
      expect(defaultTranslations.viewTrigger("year", undefined)).toBe("year view")
    })
  })

  describe("defaultTranslations.dayCell", () => {
    test("should announce unavailable dates first, regardless of other state", () => {
      const state = createDayCellState({ unavailable: true, selected: true, inRange: true })
      expect(defaultTranslations.dayCell(state)).toBe("Not available. June 15, 2024")
    })

    test("should announce the start of a range", () => {
      const state = createDayCellState({ firstInRange: true, inRange: true })
      expect(defaultTranslations.dayCell(state)).toBe("Starting range from June 15, 2024")
    })

    test("should announce the end of a range", () => {
      const state = createDayCellState({ lastInRange: true, inRange: true })
      expect(defaultTranslations.dayCell(state)).toBe("Range ending at June 15, 2024")
    })

    test("should announce dates strictly between a range's start and end", () => {
      const state = createDayCellState({ inRange: true })
      expect(defaultTranslations.dayCell(state)).toBe("In range. June 15, 2024")
    })

    test("should announce a selected date outside of a range", () => {
      const state = createDayCellState({ selected: true })
      expect(defaultTranslations.dayCell(state)).toBe("Selected date. June 15, 2024")
    })

    test("should fall back to a plain choice for an unselected date", () => {
      const state = createDayCellState()
      expect(defaultTranslations.dayCell(state)).toBe("Choose June 15, 2024")
    })
  })

  describe("getVisibleRangeText", () => {
    const startValue = parseDate("2026-06-01")
    const endValue = parseDate("2026-06-30")

    test("should not reuse memoized result across selection modes", () => {
      // same view/range/locale/timeZone, only selectionMode differs
      const range = getVisibleRangeText({
        view: "day",
        startValue,
        endValue,
        locale: "en",
        timeZone: "UTC",
        selectionMode: "range",
      })
      expect(range.formatted).toBe("June 2026 - June 2026")

      const single = getVisibleRangeText({
        view: "day",
        startValue,
        endValue,
        locale: "en",
        timeZone: "UTC",
        selectionMode: "single",
      })
      expect(single.formatted).toBe("June 2026")
    })
  })
})

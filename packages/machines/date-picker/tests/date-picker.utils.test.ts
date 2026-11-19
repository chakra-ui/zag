import { parseDate } from "@internationalized/date"
import { describe, expect, test, vi } from "vitest"
import { connect } from "../src/date-picker.connect"
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

    test("should include the visible range text in the accessible name", () => {
      expect(defaultTranslations.viewTrigger("day", "month", "February 2027")).toBe(
        "February 2027, switch to month view",
      )
      expect(defaultTranslations.viewTrigger("month", "year", "2027")).toBe("2027, switch to year view")
    })

    test("should use only the visible range text when there is no next view", () => {
      expect(defaultTranslations.viewTrigger("year", undefined, "2020 - 2029")).toBe("2020 - 2029")
    })
  })

  describe("getViewTriggerProps", () => {
    test("includes visible range text in aria-label to satisfy WCAG 2.5.3", () => {
      const startValue = parseDate("2027-02-01")
      const endValue = parseDate("2027-02-28")
      const mockService: any = {
        state: { get: () => "open", matches: () => false },
        context: {
          get: (key: string) => {
            if (key === "startValue") return startValue
            if (key === "value") return []
            return undefined
          },
        },
        computed: (key: string) => {
          if (key === "endValue") return endValue
          if (key === "isInteractive") return true
          if (key === "visibleRangeText")
            return { start: "February 2027", end: "February 2027", formatted: "February 2027" }
          return undefined
        },
        prop: (key: string) => {
          if (key === "locale") return "en-US"
          if (key === "timeZone") return "UTC"
          if (key === "selectionMode") return "single"
          if (key === "minView") return "day"
          if (key === "maxView") return "year"
          if (key === "format") return (date: any) => date?.toString() ?? ""
          return undefined
        },
        send: () => {},
        scope: { getById: () => null },
      }
      const normalizer: any = new Proxy({}, { get: () => (v: any) => v })
      const api = connect(mockService, normalizer)

      expect(api.getViewTriggerProps({ view: "day" })["aria-label"]).toBe("February 2027, switch to month view")
      expect(api.getViewTriggerProps({ view: "month" })["aria-label"]).toBe("2027, switch to year view")
      expect(api.getViewTriggerProps({ view: "year" })["aria-label"]).toBe("2020 - 2029")
    })

    test("falls back to visible text only when at maxView", () => {
      const startValue = parseDate("2027-02-01")
      const endValue = parseDate("2027-02-28")
      const mockService: any = {
        state: { get: () => "open", matches: () => false },
        context: {
          get: (key: string) => {
            if (key === "startValue") return startValue
            if (key === "value") return []
            return undefined
          },
        },
        computed: (key: string) => {
          if (key === "endValue") return endValue
          if (key === "isInteractive") return true
          return undefined
        },
        prop: (key: string) => {
          if (key === "locale") return "en-US"
          if (key === "timeZone") return "UTC"
          if (key === "selectionMode") return "single"
          if (key === "minView") return "day"
          if (key === "maxView") return "month"
          if (key === "format") return (date: any) => date?.toString() ?? ""
          return undefined
        },
        send: () => {},
        scope: { getById: () => null },
      }
      const normalizer: any = new Proxy({}, { get: () => (v: any) => v })
      const api = connect(mockService, normalizer)

      const monthTrigger = api.getViewTriggerProps({ view: "month" })
      expect(monthTrigger["aria-label"]).toBe("2027")
      expect(monthTrigger.disabled).toBe(true)
    })

    test("passes text to custom translations.viewTrigger", () => {
      const startValue = parseDate("2027-02-01")
      const endValue = parseDate("2027-02-28")
      const customViewTrigger = vi.fn((view, nextView, text) => `${text} (${view}->${nextView ?? "none"})`)
      const mockService: any = {
        state: { get: () => "open", matches: () => false },
        context: {
          get: (key: string) => {
            if (key === "startValue") return startValue
            if (key === "value") return []
            return undefined
          },
        },
        computed: (key: string) => {
          if (key === "endValue") return endValue
          if (key === "isInteractive") return true
          return undefined
        },
        prop: (key: string) => {
          if (key === "locale") return "en-US"
          if (key === "timeZone") return "UTC"
          if (key === "selectionMode") return "single"
          if (key === "minView") return "day"
          if (key === "maxView") return "year"
          if (key === "translations") return { viewTrigger: customViewTrigger }
          if (key === "format") return (date: any) => date?.toString() ?? ""
          return undefined
        },
        send: () => {},
        scope: { getById: () => null },
      }
      const normalizer: any = new Proxy({}, { get: () => (v: any) => v })
      const api = connect(mockService, normalizer)

      expect(api.getViewTriggerProps({ view: "day" })["aria-label"]).toBe("February 2027 (day->month)")
      expect(customViewTrigger).toHaveBeenCalledWith("day", "month", "February 2027")
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

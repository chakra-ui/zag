import { CalendarDate, now, parseDate, toCalendarDate, toCalendarDateTime } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { constrainValue, getDateRangePreset } from "../src"

describe("Date utilities / Time Component Comparison Issues", () => {
  const timeZone = "UTC"
  const locale = "en-US"

  test("constrainValue handles mixed date types correctly", () => {
    // Test with CalendarDate (no time)
    const calendarDate = new CalendarDate(2024, 3, 15)
    const minDate = new CalendarDate(2023, 1, 1)
    const maxDate = new CalendarDate(2023, 12, 31)

    const constrained = constrainValue(calendarDate, minDate, maxDate)
    expect(constrained.toString()).toBe("2023-12-31")
    // Should be CalendarDate type (check by ensuring it has no time properties)
    expect("hour" in constrained).toBe(false)
    expect("minute" in constrained).toBe(false)
  })

  test("constrainValue with CalendarDateTime input converts to CalendarDate", () => {
    // Test with CalendarDateTime (has time but no timezone)
    const dateTime = toCalendarDateTime(parseDate("2024-03-15"))
    const minDate = parseDate("2023-01-01")
    const maxDate = parseDate("2023-12-31")

    const constrained = constrainValue(dateTime, minDate, maxDate)
    // Should be constrained and converted to CalendarDate
    expect(constrained.toString()).toBe("2023-12-31")
    // Should be CalendarDate type (no time properties)
    expect("hour" in constrained).toBe(false)
    expect("minute" in constrained).toBe(false)
  })

  test("getDateRangePreset returns consistent CalendarDate types", () => {
    const [startDate, endDate] = getDateRangePreset("thisWeek", locale, timeZone)

    // Both dates should be CalendarDate (no time components)
    expect("hour" in startDate).toBe(false)
    expect("minute" in startDate).toBe(false)
    expect("hour" in endDate).toBe(false)
    expect("minute" in endDate).toBe(false)

    // Should be able to compare without issues
    expect(startDate.compare(endDate)).toBeLessThanOrEqual(0)
  })

  test("getDateRangePreset with different presets all return CalendarDate", () => {
    const presets = ["thisMonth", "lastWeek", "last30Days", "thisYear", "lastYear"] as const

    presets.forEach((preset) => {
      const [startDate, endDate] = getDateRangePreset(preset, locale, timeZone)

      // Both should be CalendarDate (no time properties)
      expect("hour" in startDate).toBe(false)
      expect("minute" in startDate).toBe(false)
      expect("hour" in endDate).toBe(false)
      expect("minute" in endDate).toBe(false)

      // Start should be before or equal to end
      expect(startDate.compare(endDate)).toBeLessThanOrEqual(0)
    })
  })

  test("mixed date type comparison consistency after normalization", () => {
    // Create different date types for the same date
    const baseDate = "2024-03-15"
    const calendarDate = parseDate(baseDate)
    const calendarDateTime = toCalendarDateTime(parseDate(baseDate))

    // When converted to CalendarDate, they should all be equal
    const normalizedCalendar = toCalendarDate(calendarDate)
    const normalizedDateTime = toCalendarDate(calendarDateTime)

    expect(normalizedCalendar.compare(normalizedDateTime)).toBe(0)
  })

  test("constrainValue preserves date when already within bounds", () => {
    const date = parseDate("2023-06-15")
    const minDate = parseDate("2023-01-01")
    const maxDate = parseDate("2023-12-31")

    const constrained = constrainValue(date, minDate, maxDate)
    expect(constrained.toString()).toBe("2023-06-15")
    // Should be CalendarDate type
    expect("hour" in constrained).toBe(false)
    expect("minute" in constrained).toBe(false)
  })

  test("constrainValue applies min constraint correctly", () => {
    const date = parseDate("2022-06-15") // Before min
    const minDate = parseDate("2023-01-01")
    const maxDate = parseDate("2023-12-31")

    const constrained = constrainValue(date, minDate, maxDate)
    expect(constrained.toString()).toBe("2023-01-01")
  })

  test("constrainValue applies max constraint correctly", () => {
    const date = parseDate("2024-06-15") // After max
    const minDate = parseDate("2023-01-01")
    const maxDate = parseDate("2023-12-31")

    const constrained = constrainValue(date, minDate, maxDate)
    expect(constrained.toString()).toBe("2023-12-31")
  })

  test("preset functions handle now() conversion correctly", () => {
    // Test that now() is properly converted to CalendarDate in presets
    const nowResult = now(timeZone)
    const convertedNow = toCalendarDate(nowResult)

    // now() returns ZonedDateTime with time properties
    expect("hour" in nowResult).toBe(true)
    expect("minute" in nowResult).toBe(true)

    // toCalendarDate strips time properties
    expect("hour" in convertedNow).toBe(false)
    expect("minute" in convertedNow).toBe(false)

    // They should represent the same date
    expect(convertedNow.year).toBe(nowResult.year)
    expect(convertedNow.month).toBe(nowResult.month)
    expect(convertedNow.day).toBe(nowResult.day)
  })
})

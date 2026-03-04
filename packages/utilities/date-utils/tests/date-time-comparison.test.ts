import {
  CalendarDate,
  CalendarDateTime,
  now,
  parseDate,
  toCalendarDate,
  toCalendarDateTime,
} from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { constrainValue, getDateRangePreset } from "../src"

describe("Date utilities / Time Component Comparison Issues", () => {
  const timeZone = "UTC"
  const locale = "en-US"

  test("constrainValue handles CalendarDate types correctly", () => {
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

  test("constrainValue with CalendarDateTime preserves time when date changes", () => {
    // Test with CalendarDateTime (has time but no timezone)
    const dateTime = new CalendarDateTime(2024, 3, 15, 14, 30, 45)
    const minDate = parseDate("2023-01-01")
    const maxDate = parseDate("2023-12-31")

    const constrained = constrainValue(dateTime, minDate, maxDate)
    // Should be constrained to max date
    expect(constrained.year).toBe(2023)
    expect(constrained.month).toBe(12)
    expect(constrained.day).toBe(31)
    // Should preserve time components
    expect("hour" in constrained).toBe(true)
    expect(constrained.hour).toBe(14)
    expect(constrained.minute).toBe(30)
    expect(constrained.second).toBe(45)
  })

  test("constrainValue with CalendarDateTime preserves type when within bounds", () => {
    const dateTime = new CalendarDateTime(2023, 6, 15, 10, 20, 30)
    const minDate = parseDate("2023-01-01")
    const maxDate = parseDate("2023-12-31")

    const constrained = constrainValue(dateTime, minDate, maxDate)
    // Should return original with time preserved
    expect(constrained.toString()).toBe("2023-06-15T10:20:30")
    expect("hour" in constrained).toBe(true)
    expect(constrained.hour).toBe(10)
    expect(constrained.minute).toBe(20)
    expect(constrained.second).toBe(30)
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

  const presets = ["thisMonth", "lastWeek", "last30Days", "thisYear", "lastYear"] as const

  test("getDateRangePreset with different presets all return CalendarDate", () => {
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
    // Should preserve original type (CalendarDate)
    expect("hour" in constrained).toBe(false)
    expect("minute" in constrained).toBe(false)
  })

  test("constrainValue preserves CalendarDateTime when already within bounds", () => {
    const date = new CalendarDateTime(2023, 6, 15, 9, 45, 30)
    const minDate = parseDate("2023-01-01")
    const maxDate = parseDate("2023-12-31")

    const constrained = constrainValue(date, minDate, maxDate)
    // Should return the exact same object since date is within bounds
    expect(constrained).toBe(date)
    expect(constrained.toString()).toBe("2023-06-15T09:45:30")
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

  test("constrainValue with CalendarDateTime preserves time when applying min constraint", () => {
    const dateTime = new CalendarDateTime(2022, 6, 15, 8, 15, 0) // Before min
    const minDate = parseDate("2023-01-01")
    const maxDate = parseDate("2023-12-31")

    const constrained = constrainValue(dateTime, minDate, maxDate)
    // Should be constrained to min date
    expect(constrained.year).toBe(2023)
    expect(constrained.month).toBe(1)
    expect(constrained.day).toBe(1)
    // Should preserve time components
    expect("hour" in constrained).toBe(true)
    expect(constrained.hour).toBe(8)
    expect(constrained.minute).toBe(15)
  })

  test("constrainValue with ZonedDateTime preserves time and timezone", () => {
    const zonedDateTime = now("America/New_York")
    // Create a date far in the future to ensure it gets constrained
    const futureDate = zonedDateTime.add({ years: 5 })
    const minDate = parseDate("2023-01-01")
    const maxDate = parseDate("2023-12-31")

    const constrained = constrainValue(futureDate, minDate, maxDate)
    // Should preserve the ZonedDateTime type with timezone
    expect("hour" in constrained).toBe(true)
    expect("timeZone" in constrained).toBe(true)
    expect(constrained.year).toBe(2023)
    expect(constrained.month).toBe(12)
    expect(constrained.day).toBe(31)
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

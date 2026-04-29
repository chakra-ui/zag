import { CalendarDate, CalendarDateTime, ZonedDateTime, parseDate } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { constrainSegments } from "../src"

describe("constrainSegments", () => {
  test("returns the same date when within bounds", () => {
    const date = parseDate("2010-06-15")
    const min = parseDate("2000-01-01")
    const max = parseDate("2030-12-31")

    const result = constrainSegments(date, min, max)
    expect(result).toBe(date)
  })

  test("returns the same date when no min or max provided", () => {
    const date = parseDate("1500-01-01")
    expect(constrainSegments(date)).toBe(date)
  })

  test("only fixes year when month/day are within range after year fix (min)", () => {
    const date = parseDate("1999-06-15")
    const min = parseDate("2000-01-01")
    const result = constrainSegments(date, min, undefined)
    expect(result.toString()).toBe("2000-06-15")
  })

  test("fixes year and month when month is below min and day is preserved", () => {
    const date = parseDate("1999-03-20")
    const min = parseDate("2000-06-15")
    const result = constrainSegments(date, min, undefined)
    expect(result.toString()).toBe("2000-06-20")
  })

  test("fixes year, month, and day when all are below min", () => {
    const date = parseDate("1999-06-10")
    const min = parseDate("2000-06-15")
    const result = constrainSegments(date, min, undefined)
    expect(result.toString()).toBe("2000-06-15")
  })

  test("only fixes year when above max if month/day already < max month/day", () => {
    const date = parseDate("2050-03-10")
    const max = parseDate("2030-12-31")
    const result = constrainSegments(date, undefined, max)
    expect(result.toString()).toBe("2030-03-10")
  })

  test("fixes year and month when month is above max in same year", () => {
    const date = parseDate("2050-08-10")
    const max = parseDate("2030-06-15")
    const result = constrainSegments(date, undefined, max)
    expect(result.toString()).toBe("2030-06-10")
  })

  test("fixes year, month, and day when all above max", () => {
    const date = parseDate("2050-08-20")
    const max = parseDate("2030-06-15")
    const result = constrainSegments(date, undefined, max)
    expect(result.toString()).toBe("2030-06-15")
  })

  test("preserves time when year is out of range (CalendarDateTime)", () => {
    const date = new CalendarDateTime(1999, 6, 15, 14, 30, 45)
    const min = parseDate("2000-01-01")
    const result = constrainSegments(date, min, undefined)
    expect(result.year).toBe(2000)
    expect(result.month).toBe(6)
    expect(result.day).toBe(15)
    expect("hour" in result && result.hour).toBe(14)
    expect("minute" in result && result.minute).toBe(30)
    expect("second" in result && result.second).toBe(45)
  })

  test("preserves time when within bounds (CalendarDateTime)", () => {
    const date = new CalendarDateTime(2010, 6, 15, 14, 30, 45)
    const min = parseDate("2000-01-01")
    const max = parseDate("2030-12-31")
    const result = constrainSegments(date, min, max)
    expect(result).toBe(date)
  })

  test("preserves time and timezone (ZonedDateTime)", () => {
    const date = new ZonedDateTime(1999, 6, 15, "America/Los_Angeles", -28800000, 14, 30, 45)
    const min = parseDate("2000-01-01")
    const result = constrainSegments(date, min, undefined)
    expect(result.year).toBe(2000)
    expect(result.month).toBe(6)
    expect(result.day).toBe(15)
    expect("hour" in result && result.hour).toBe(14)
    expect("timeZone" in result && result.timeZone).toBe("America/Los_Angeles")
  })

  test("returns CalendarDate when input is CalendarDate", () => {
    const date = new CalendarDate(1999, 6, 15)
    const min = parseDate("2000-01-01")
    const result = constrainSegments(date, min, undefined)
    expect("hour" in result).toBe(false)
    expect(result.toString()).toBe("2000-06-15")
  })

  test("compares vs constrainValue: preserves data when only year is out of range", () => {
    const date = parseDate("1899-12-25")
    const min = parseDate("1900-01-01")

    const result = constrainSegments(date, min, undefined)
    expect(result.toString()).toBe("1900-12-25")
  })

  test("handles dates far below min (multiple segments need fixing)", () => {
    const date = parseDate("1500-01-01")
    const min = parseDate("2000-06-15")
    const result = constrainSegments(date, min, undefined)
    expect(result.toString()).toBe("2000-06-15")
  })

  test("handles leap-year edge: Feb 29 → non-leap year clamps day to 28", () => {
    const date = new CalendarDate(2096, 2, 29)
    const max = parseDate("1900-12-31")
    const result = constrainSegments(date, undefined, max)
    expect(result.year).toBe(1900)
    expect(result.month).toBe(2)
    expect(result.day).toBe(28)
  })
})

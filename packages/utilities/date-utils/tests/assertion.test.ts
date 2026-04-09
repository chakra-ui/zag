import { CalendarDate, CalendarDateTime, parseDate, ZonedDateTime } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { isDateEqual } from "../src"

describe("Date utilities / Assertion", () => {
  test("isEqual / CalendarDate / truthy", () => {
    const dateA = parseDate("2024-03-15")
    const dateB = parseDate("2024-03-15")
    expect(isDateEqual(dateA, dateB)).toBe(true)
  })

  test("isEqual / CalendarDate / falsy", () => {
    const dateA = parseDate("2024-04-15")
    const dateB = parseDate("2024-03-15")
    expect(isDateEqual(dateA, dateB)).toBe(true)
  })

  test("isEqual / CalendarDateTime / truthy", () => {
    const dateA = new CalendarDateTime(2024, 3, 15, 0, 0, 0)
    const dateB = new CalendarDateTime(2024, 3, 15, 0, 0, 0)
    expect(isDateEqual(dateA, dateB)).toBe(true)
  })

  test("isEqual / CalendarDateTime / falsy", () => {
    const dateA = new CalendarDateTime(2024, 3, 15, 0, 0, 0)
    const dateB = new CalendarDateTime(2024, 3, 15, 0, 0, 1)
    expect(isDateEqual(dateA, dateB)).toBe(false)
  })

  test("isEqual / ZonedCalendarDate / truthy", () => {
    const dateA = new ZonedDateTime(2024, 3, 15, "UTC", 0, 0, 0)
    const dateB = new ZonedDateTime(2024, 3, 15, "UTC+1", 0, 0, 0)
    expect(isDateEqual(dateA, dateB)).toBe(true)
  })

  test("isEqual / ZonedCalendarDate / falsy", () => {
    const dateA = new ZonedDateTime(2024, 3, 15, "UTC", 0, 0, 0)
    const dateB = new ZonedDateTime(2024, 3, 15, "UTC+1", 0, 0, 1)
    expect(isDateEqual(dateA, dateB)).toBe(false)
  })

  test("isEqual / CalendarDate with CalendarDateTime / truthy", () => {
    const dateA = new CalendarDate(2024, 3, 15)
    const dateB = new CalendarDateTime(2024, 3, 15, 0, 0, 0)
    expect(isDateEqual(dateA, dateB)).toBe(true)
    expect(isDateEqual(dateB, dateA)).toBe(true)
  })

  test("isEqual / CalendarDate with CalendarDateTime / falsy", () => {
    const dateA = new CalendarDate(2024, 3, 15)
    const dateB = new CalendarDateTime(2024, 3, 15, 0, 0, 1)
    expect(isDateEqual(dateA, dateB)).toBe(false)
    expect(isDateEqual(dateB, dateA)).toBe(false)
  })

  test("isEqual / both null", () => {
    expect(isDateEqual(null, null)).toBe(true)
  })

  test("isEqual / both undefined", () => {
    expect(isDateEqual(undefined, undefined)).toBe(true)
  })

  test("isEqual / null and undefined", () => {
    expect(isDateEqual(null, undefined)).toBe(false)
    expect(isDateEqual(undefined, null)).toBe(false)
  })

  test("isEqual / dateA null, dateB valid", () => {
    const dateB = parseDate("2024-04-15")
    expect(isDateEqual(null, dateB)).toBe(false)
  })

  test("isEqual / dateA valid, dateB null", () => {
    const dateA = parseDate("2024-04-15")
    expect(isDateEqual(dateA, null)).toBe(false)
  })

  test("isEqual / dateA undefined, dateB valid", () => {
    const dateB = parseDate("2024-04-15")
    expect(isDateEqual(undefined, dateB)).toBe(false)
  })

  test("isEqual / dateA valid, dateB undefined", () => {
    const dateA = parseDate("2024-04-15")
    expect(isDateEqual(dateA, undefined)).toBe(false)
  })
})

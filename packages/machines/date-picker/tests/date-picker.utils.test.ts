import { parseDate } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { adjustStartAndEndDate, isDateWithinRange, sortDates } from "../src/date-picker.utils"

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
})

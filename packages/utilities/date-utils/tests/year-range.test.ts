import { CalendarDate, toCalendar } from "@internationalized/date"
import { PersianCalendar } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { getDefaultYearRange, getYearsRange } from "../src"

describe("Date utilities", () => {
  test("get year range", () => {
    expect(getYearsRange({ from: 2010, to: 2030 })).toMatchInlineSnapshot(`
      [
        2010,
        2011,
        2012,
        2013,
        2014,
        2015,
        2016,
        2017,
        2018,
        2019,
        2020,
        2021,
        2022,
        2023,
        2024,
        2025,
        2026,
        2027,
        2028,
        2029,
        2030,
      ]
    `)
  })

  test("getDefaultYearRange returns 1900-2099 for Gregorian", () => {
    const date = new CalendarDate(2024, 6, 15)
    const range = getDefaultYearRange(date)
    expect(range).toEqual({ from: 1900, to: 2099 })
  })

  test("getDefaultYearRange converts to target calendar years", () => {
    const persianDate = toCalendar(new CalendarDate(2024, 6, 15), new PersianCalendar())
    const range = getDefaultYearRange(persianDate)
    // 1900 Gregorian ≈ 1278 Persian, 2099 Gregorian ≈ 1478 Persian
    expect(range.from).toBeLessThan(1900)
    expect(range.to).toBeLessThan(2099)
    expect(range.from).toBeGreaterThan(1200)
    expect(range.to).toBeLessThan(1500)
  })

  test("getDefaultYearRange respects min/max", () => {
    const date = new CalendarDate(2024, 6, 15)
    const min = new CalendarDate(2000, 1, 1)
    const max = new CalendarDate(2050, 12, 31)
    const range = getDefaultYearRange(date, min, max)
    expect(range).toEqual({ from: 2000, to: 2050 })
  })
})

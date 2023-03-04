import { parseDate } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { getMonthDates, getWeekDays } from "../src"

const timeZone = "UTC"
const locale = "en-US"

describe("Date utilities", () => {
  test("should get week dates", () => {
    expect(getWeekDays(parseDate("2023-01-10"), timeZone, locale)).toMatchInlineSnapshot(`
      [
        2023-01-08T00:00:00.000Z,
        2023-01-09T00:00:00.000Z,
        2023-01-10T00:00:00.000Z,
        2023-01-11T00:00:00.000Z,
        2023-01-12T00:00:00.000Z,
        2023-01-13T00:00:00.000Z,
        2023-01-14T00:00:00.000Z,
      ]
    `)
  })

  test("should get month dates", () => {
    expect(getMonthDates(parseDate("2023-01-10"), { months: 1 }, locale).map((date) => date.toString()))
      .toMatchInlineSnapshot(`
      [
        "2023-01-08,2023-01-09,2023-01-10,2023-01-11,2023-01-12,2023-01-13,2023-01-14",
        "2023-01-15,2023-01-16,2023-01-17,2023-01-18,2023-01-19,2023-01-20,2023-01-21",
        "2023-01-22,2023-01-23,2023-01-24,2023-01-25,2023-01-26,2023-01-27,2023-01-28",
        "2023-01-29,2023-01-30,2023-01-31,2023-02-01,2023-02-02,2023-02-03,2023-02-04",
        "2023-02-05,2023-02-06,2023-02-07,2023-02-08,2023-02-09,2023-02-10,2023-02-11",
      ]
    `)
  })
})

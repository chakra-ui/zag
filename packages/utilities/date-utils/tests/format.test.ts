import { parseDate } from "@internationalized/date"
import { expect, test } from "vitest"
import { formatSelectedDate, formatVisibleRange } from "../src"

const locale = "en-US"
const timeZone = "UTC"

const startDate = parseDate("2023-01-10")
const endDate = parseDate("2023-01-12")

test("formatSelectedDate / selected date", () => {
  expect(formatSelectedDate(startDate, null, locale, timeZone)).toMatchInlineSnapshot(`"Tuesday, January 10, 2023"`)

  expect(formatSelectedDate(startDate, endDate, locale, timeZone)).toMatchInlineSnapshot(
    `"Tuesday, January 10 – Thursday, January 12, 2023"`,
  )
})

test("formatVisibleRange / visible range", () => {
  expect(formatVisibleRange(startDate, endDate, locale, timeZone)).toMatchInlineSnapshot(
    '"Tuesday, January 10 – Thursday, January 12, 2023"',
  )

  expect(formatVisibleRange(startDate, endDate, locale, timeZone)).toMatchInlineSnapshot(
    '"Tuesday, January 10 – Thursday, January 12, 2023"',
  )
})

import { DateFormatter, parseDate } from "@internationalized/date"
import { formatSelectedDate, formatVisibleRange } from "../src"

const locale = "en-US"
const timeZone = "UTC"

const startDate = parseDate("2023-01-10")
const endDate = parseDate("2023-01-12")

const getFormatter = (options: any) => new DateFormatter(locale, options)

describe("Date utilities", () => {
  test("format / selected date", () => {
    expect(formatSelectedDate(startDate, null, getFormatter, false, timeZone)).toMatchInlineSnapshot(
      `"Tuesday, January 10, 2023"`,
    )

    // is selecting range
    expect(formatSelectedDate(startDate, endDate, getFormatter, true, timeZone)).toMatchInlineSnapshot(`""`)

    expect(formatSelectedDate(startDate, endDate, getFormatter, false, timeZone)).toMatchInlineSnapshot(
      `"Tuesday, January 10 – Thursday, January 12, 2023"`,
    )
  })

  test("format / visible range", () => {
    expect(formatVisibleRange(startDate, endDate, getFormatter, false, timeZone)).toMatchInlineSnapshot(
      `"Tuesday, January 10 – Thursday, January 12, 2023"`,
    )

    expect(formatVisibleRange(startDate, endDate, getFormatter, true, timeZone)).toMatchInlineSnapshot(
      `"Tuesday, January 10 – Thursday, January 12, 2023"`,
    )
  })
})

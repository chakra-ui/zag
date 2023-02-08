import { parseDate } from "@internationalized/date"
import { constrainValue, getNextPage, getPreviousPage } from "../src"

const locale = "en-US"
// const timeZone = "UTC"
const duration = { months: 1 }

const min = parseDate("2023-01-01")
const max = parseDate("2023-12-31")

const stringify = (opts: any) => ({
  startDate: opts.startDate.toString(),
  endDate: opts.endDate.toString(),
  focusedDate: opts.focusedDate.toString(),
})

describe("Date utilities", () => {
  test("constrain", () => {
    const focusedDate = parseDate("2024-03-15")
    expect(constrainValue(focusedDate, min, max).toString()).toMatchInlineSnapshot(`"2023-12-31"`)
  })

  test("pagination / next page", () => {
    const focusedDate = parseDate("2023-01-12")
    const startDate = parseDate("2023-01-01")
    const nextPage = getNextPage(focusedDate, startDate, duration, locale, min, max)
    expect(stringify(nextPage)).toMatchInlineSnapshot(`
      {
        "endDate": "2023-02-28",
        "focusedDate": "2023-02-12",
        "startDate": "2023-02-01",
      }
    `)
  })

  test("pagination / prev page", () => {
    const focusedDate = parseDate("2023-01-12")
    const startDate = parseDate("2023-01-01")
    const prevPage = getPreviousPage(focusedDate, startDate, duration, locale, min, max)
    expect(stringify(prevPage)).toMatchInlineSnapshot(`
      {
        "endDate": "2023-01-31",
        "focusedDate": "2023-01-01",
        "startDate": "2023-01-01",
      }
    `)
  })
})

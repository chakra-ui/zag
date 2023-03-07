import { CalendarDate } from "@internationalized/date"
import { getMonthDays } from "../src/get-month-days"

describe("getMonthDays", () => {
  it("en / returns the list of month dates", () => {
    const days = getMonthDays(new CalendarDate(2023, 1, 1), "en")
    const dateStrings = days.map((weeks) => weeks.map((date) => date?.toString()))
    expect(dateStrings).toMatchInlineSnapshot(`
      [
        [
          "2023-01-01",
          "2023-01-02",
          "2023-01-03",
          "2023-01-04",
          "2023-01-05",
          "2023-01-06",
          "2023-01-07",
        ],
        [
          "2023-01-08",
          "2023-01-09",
          "2023-01-10",
          "2023-01-11",
          "2023-01-12",
          "2023-01-13",
          "2023-01-14",
        ],
        [
          "2023-01-15",
          "2023-01-16",
          "2023-01-17",
          "2023-01-18",
          "2023-01-19",
          "2023-01-20",
          "2023-01-21",
        ],
        [
          "2023-01-22",
          "2023-01-23",
          "2023-01-24",
          "2023-01-25",
          "2023-01-26",
          "2023-01-27",
          "2023-01-28",
        ],
        [
          "2023-01-29",
          "2023-01-30",
          "2023-01-31",
          "2023-02-01",
          "2023-02-02",
          "2023-02-03",
          "2023-02-04",
        ],
      ]
    `)
  })
})

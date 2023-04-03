import { getMonthNames } from "../src/get-month-names"

describe("getMonthNames", () => {
  it("en / returns the list of month names", () => {
    expect(getMonthNames("en")).toEqual([
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ])
  })

  it("en / returns the list of month names in short format", () => {
    expect(getMonthNames("en", "short")).toEqual([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ])
  })

  it("en / returns the list of month names in numeric format", () => {
    expect(getMonthNames("ru")).toMatchInlineSnapshot(`
      [
        "январь",
        "февраль",
        "март",
        "апрель",
        "май",
        "июнь",
        "июль",
        "август",
        "сентябрь",
        "октябрь",
        "ноябрь",
        "декабрь",
      ]
    `)
  })
})

import { CalendarDate, PersianCalendar, toCalendar } from "@internationalized/date"
import { getMonthNames } from "../src"

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

  it("fa-IR / returns Persian month names when given a Persian referenceDate", () => {
    const persianDate = toCalendar(new CalendarDate(2024, 3, 20), new PersianCalendar())
    const months = getMonthNames("fa-IR", "long", persianDate)
    expect(months).toHaveLength(12)
    // Should not contain Gregorian month names
    expect(months[0]).not.toBe("January")
    // First Persian month is Farvardin
    expect(months[0]).toContain("فروردین")
  })

  it("en / returns 12 Gregorian months when referenceDate is Gregorian", () => {
    const gregorianDate = new CalendarDate(2024, 6, 15)
    const months = getMonthNames("en", "long", gregorianDate)
    expect(months).toHaveLength(12)
    expect(months[0]).toBe("January")
  })
})

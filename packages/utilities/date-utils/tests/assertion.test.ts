import { parseDate } from "@internationalized/date"
import { getEndDate, isDateDisabled, isDateEqual } from "../src"

const duration = { months: 1 }

const min = parseDate("2023-01-01")
const max = parseDate("2023-12-31")

describe("Date utilities / Assertion", () => {
  test("isEqual / truthy", () => {
    const dateA = parseDate("2024-03-15")
    const dateB = parseDate("2024-03-15")
    expect(isDateEqual(dateA, dateB)).toBe(true)
  })

  test("isEqual / falsy", () => {
    const dateA = parseDate("2024-04-15")
    const dateB = parseDate("2024-03-15")
    expect(isDateEqual(dateA, dateB)).toBe(false)
  })

  test("isEqual / nullish", () => {
    const dateA = parseDate("2024-04-15")
    expect(isDateEqual(dateA, null)).toBe(false)
  })

  test("isDisabled / truthy", () => {
    const date = parseDate("2024-04-15")

    const startDate = parseDate("2024-04-01")
    const endDate = getEndDate(startDate, duration)

    expect(isDateDisabled(date, startDate, endDate, min, max)).toBe(true)
  })

  test("isDisabled / falsy", () => {
    const date = parseDate("2023-04-15")

    const startDate = parseDate("2023-04-01")
    const endDate = getEndDate(startDate, duration)

    expect(isDateDisabled(date, startDate, endDate, min, max)).toBe(false)
  })
})

import { parseDate } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { isDateEqual } from "../src"

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
})

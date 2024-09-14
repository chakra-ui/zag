import { describe, expect, test } from "vitest"
import { normalizeYear } from "../src/normalize-year"

describe("normalize year", () => {
  test("with 2 digits", () => {
    expect(normalizeYear("23")).toBe("2023")
  })

  test("with 3 digits", () => {
    expect(normalizeYear("123")).toBe("1230")
  })

  test("with 4 digits", () => {
    expect(normalizeYear("2023")).toBe("2023")
  })
})

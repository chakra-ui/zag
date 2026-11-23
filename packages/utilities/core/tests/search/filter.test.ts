import { describe, expect, test } from "vitest"
import { createFilter } from "../../src/search"

describe("createFilter", () => {
  const { startsWith, endsWith, contains } = createFilter({ sensitivity: "base" })

  test("ignores case and accents", () => {
    expect(startsWith("Éditer", "edi")).toBe(true)
    expect(endsWith("Café", "CAFE")).toBe(true)
    expect(contains("Crème brûlée", "brulee")).toBe(true)
  })

  test("matches composed and decomposed text", () => {
    expect(contains("Café", "café")).toBe(true)
  })

  test("returns false when nothing matches", () => {
    expect(startsWith("Apple", "pp")).toBe(false)
    expect(contains("Apple", "xyz")).toBe(false)
    expect(contains("ab", "abc")).toBe(false)
  })

  test("respects case when sensitivity is variant", () => {
    const filter = createFilter()
    expect(filter.contains("Apple", "apple")).toBe(false)
    expect(filter.contains("Apple", "App")).toBe(true)
  })
})

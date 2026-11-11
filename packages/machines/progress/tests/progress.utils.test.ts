import { describe, expect, test } from "vitest"
import { getClampedValue, getPercent, getProgressState } from "../src/progress.utils"

describe("getClampedValue", () => {
  test("keeps values inside the range", () => {
    expect(getClampedValue(30, 20, 40)).toBe(30)
  })

  test("clamps values outside the range", () => {
    expect(getClampedValue(50, 0, 40)).toBe(40)
    expect(getClampedValue(10, 20, 40)).toBe(20)
    expect(getClampedValue(-30, -20, 40)).toBe(-20)
  })

  test("treats null and non-finite values as indeterminate", () => {
    expect(getClampedValue(null, 0, 100)).toBeNull()
    expect(getClampedValue(Number.NaN, 0, 100)).toBeNull()
    expect(getClampedValue(Number.POSITIVE_INFINITY, 0, 100)).toBeNull()
    expect(getClampedValue(Number.NEGATIVE_INFINITY, 0, 100)).toBeNull()
  })
})

describe("getPercent", () => {
  test("places the value within a custom range", () => {
    expect(getPercent(30, 20, 40)).toBe(50)
    expect(getPercent(10, -20, 40)).toBe(50)
  })

  test("returns 0 for an empty range", () => {
    expect(getPercent(5, 5, 5)).toBe(0)
  })

  test("returns 0 when indeterminate", () => {
    expect(getPercent(null, 0, 100)).toBe(0)
  })
})

describe("getProgressState", () => {
  test("maps the value to a state", () => {
    expect(getProgressState(null, 100)).toBe("indeterminate")
    expect(getProgressState(40, 100)).toBe("loading")
    expect(getProgressState(100, 100)).toBe("complete")
  })
})

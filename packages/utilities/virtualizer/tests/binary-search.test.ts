import { describe, expect, test } from "vitest"
import { findInsertionIndex, findInsertionIndexRight, findNearestIndex } from "../src/utils/binary-search"

describe("@zag-js/virtualizer - binary search utils", () => {
  test("findInsertionIndex (lower bound) returns first index where value can be inserted", () => {
    const items = [1, 2, 2, 5]
    expect(findInsertionIndex(items, 0, (x) => x)).toBe(0)
    expect(findInsertionIndex(items, 1, (x) => x)).toBe(0)
    expect(findInsertionIndex(items, 2, (x) => x)).toBe(1)
    expect(findInsertionIndex(items, 3, (x) => x)).toBe(3)
    expect(findInsertionIndex(items, 6, (x) => x)).toBe(4)
  })

  test("findInsertionIndexRight (upper bound) returns first index strictly greater than value", () => {
    const items = [1, 2, 2, 5]
    expect(findInsertionIndexRight(items, 0, (x) => x)).toBe(0)
    expect(findInsertionIndexRight(items, 1, (x) => x)).toBe(1)
    expect(findInsertionIndexRight(items, 2, (x) => x)).toBe(3)
    expect(findInsertionIndexRight(items, 3, (x) => x)).toBe(3)
    expect(findInsertionIndexRight(items, 5, (x) => x)).toBe(4)
    expect(findInsertionIndexRight(items, 6, (x) => x)).toBe(4)
  })

  test("handles empty arrays", () => {
    expect(findInsertionIndex([], 123, (x) => x)).toBe(0)
    expect(findInsertionIndexRight([], 123, (x) => x)).toBe(0)
  })

  test("findNearestIndex returns index of nearest value (or exact match)", () => {
    const items = [0, 10, 20, 30]
    expect(findNearestIndex(items, 0, (x) => x)).toBe(0)
    expect(findNearestIndex(items, 30, (x) => x)).toBe(3)
    expect(findNearestIndex(items, 21, (x) => x)).toBe(2)
    expect(findNearestIndex(items, 29, (x) => x)).toBe(3)
  })

  test("findNearestIndex returns -1 for empty array", () => {
    expect(findNearestIndex([], 123, (x) => x)).toBe(-1)
  })
})

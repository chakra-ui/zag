import { describe, expect, test } from "vitest"
import { isEqual } from "../src/equal"

describe("isEqual", () => {
  test("should return true for equal primitive values", () => {
    expect(isEqual(1, 1)).toBe(true)
    expect(isEqual("a", "a")).toBe(true)
    expect(isEqual(true, true)).toBe(true)
  })

  test("should return false for unequal primitive values", () => {
    expect(isEqual(1, 2)).toBe(false)
    expect(isEqual("a", "b")).toBe(false)
    expect(isEqual(true, false)).toBe(false)
  })

  test("should return true for equal object values", () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { a: 1, b: 2 }
    expect(isEqual(obj1, obj2)).toBe(true)
  })

  test("should return false for unequal object values", () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { a: 2, b: 2 }
    expect(isEqual(obj1, obj2)).toBe(false)
  })

  test("should check deep object values", () => {
    const obj1 = { positioning: { placement: "start" } }
    const obj2 = { positioning: { placement: "start" } }
    expect(isEqual(obj1, obj2)).toBe(true)
  })

  test("should compare with proxy", () => {
    const obj1 = { a: 1, b: 2, c: [1] }
    const obj2 = new Proxy({ a: 1, b: 2, c: [1] }, {})
    expect(isEqual(obj1, obj2)).toBe(true)
  })

  test("should respect positional equality", () => {
    const arr1 = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const arr2 = [{ id: 2 }, { id: 1 }, { id: 3 }]
    expect(isEqual(arr1, arr2)).toBe(false)
  })

  test("compares arrays in place", () => {
    expect(isEqual([1, { a: 1 }], [1, { a: 1 }])).toBe(true)
    expect(isEqual([1, 2], [1, 2, 3])).toBe(false)
  })

  test("compares key counts in both directions", () => {
    expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false)
    expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
  })

  test("a value that loses a key is not equal to its wider previous value", () => {
    const prev = { year: true, month: true, day: true, hour: true }
    const next = { year: true, month: true, day: true }
    expect(isEqual(prev, next)).toBe(false)
    expect(isEqual(next, prev)).toBe(false)
  })

  test("distinguishes an explicit undefined key from a missing one", () => {
    expect(isEqual({ a: 1, b: undefined }, { a: 1 })).toBe(false)
  })

  test("compares functions by reference", () => {
    const fn = () => {}
    expect(isEqual(fn, fn)).toBe(true)
    expect(
      isEqual(
        () => 1,
        () => 1,
      ),
    ).toBe(false)
  })

  test("delegates to isEqual methods", () => {
    const a = { id: 1, isEqual: (other: { id: number }) => other.id === 1 }
    const b = { id: 1, isEqual: () => false }
    expect(isEqual(a, b)).toBe(true)
  })

  test("treats null and undefined as unequal to values", () => {
    expect(isEqual(null, null)).toBe(true)
    expect(isEqual(undefined, undefined)).toBe(true)
    expect(isEqual(null, undefined)).toBe(false)
    expect(isEqual({ a: 1 }, null)).toBe(false)
  })
})

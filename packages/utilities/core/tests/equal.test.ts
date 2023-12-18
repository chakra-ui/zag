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
})

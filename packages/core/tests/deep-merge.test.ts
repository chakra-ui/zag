import { describe, expect, test } from "vitest"
import { deepMerge } from "../src/deep-merge"

describe("deepMerge", () => {
  test("basic object merging", () => {
    const obj1 = { a: 1 }
    const obj2 = { b: 2 }
    expect(deepMerge<any>(obj1, obj2)).toEqual({ a: 1, b: 2 })
  })

  test("deep object merging", () => {
    const obj1 = { a: { x: 1 } }
    const obj2 = { a: { y: 2 } }
    expect(deepMerge<any>(obj1, obj2)).toEqual({ a: { x: 1, y: 2 } })
  })

  test("multiple objects merging", () => {
    const obj1 = { a: 1 }
    const obj2 = { b: 2 }
    const obj3 = { c: 3 }
    expect(deepMerge<any>(obj1, obj2, obj3)).toEqual({ a: 1, b: 2, c: 3 })
  })

  test("overwriting primitives", () => {
    const obj1 = { a: 1 }
    const obj2 = { a: 2 }
    expect(deepMerge<any>(obj1, obj2)).toEqual({ a: 2 })
  })

  test("handles nested object overwriting primitive", () => {
    const obj1 = { a: 1 }
    const obj2 = { a: { b: 2 } }
    expect(deepMerge<any>(obj1, obj2)).toEqual({ a: { b: 2 } })
  })

  // Security Tests
  test("prevents prototype pollution", () => {
    const malicious = { __proto__: { polluted: true } }
    const obj = {}
    deepMerge<any>(obj, malicious)
    expect(({} as any).polluted).toBeUndefined()
  })

  test("prevents constructor pollution", () => {
    const malicious = { constructor: { polluted: true } }
    const obj = {}
    deepMerge<any>(obj, malicious)
    // @ts-expect-error
    expect(Object.prototype.polluted).toBeUndefined()
  })

  test("prevents prototype key pollution", () => {
    const malicious = { prototype: { polluted: true } }
    const obj = {}
    deepMerge<any>(obj, malicious)
    // @ts-expect-error
    expect(Object.prototype.polluted).toBeUndefined()
  })

  // Input Validation Tests
  test("throws on non-object source", () => {
    expect(() => deepMerge<any>([] as any, {})).toThrow(TypeError)
    expect(() => deepMerge<any>(null as any, {})).toThrow(TypeError)
    expect(() => deepMerge<any>(42 as any, {})).toThrow(TypeError)
  })

  test("skips non-object arguments", () => {
    expect(() => deepMerge<any>({}, [] as any)).not.toThrow()
    expect(() => deepMerge<any>({}, null as any)).not.toThrow()
    expect(() => deepMerge<any>({}, 42 as any)).not.toThrow()
  })

  // Edge Cases
  test("handles empty objects", () => {
    expect(deepMerge<any>({}, {})).toEqual({})
  })

  test("preserves source object when no arguments provided", () => {
    const source = { a: 1 }
    expect(deepMerge<any>(source)).toEqual({ a: 1 })
  })

  test("handles nested arrays", () => {
    const obj1 = { arr: [1, 2] }
    const obj2 = { arr: [3, 4] }
    expect(deepMerge<any>(obj1, obj2)).toEqual({ arr: [3, 4] })
  })

  test("handles null values", () => {
    const obj1 = { a: null }
    const obj2 = { b: null }
    expect(deepMerge<any>(obj1, obj2)).toEqual({ a: null, b: null })
  })

  test("handles undefined values", () => {
    const obj1 = { a: undefined }
    const obj2 = { b: undefined }
    expect(deepMerge<any>(obj1, obj2)).toEqual({ a: undefined, b: undefined })
  })
})

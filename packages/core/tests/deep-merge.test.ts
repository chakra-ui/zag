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

  test("merges nested objects recursively", () => {
    const obj1 = {
      a: { x: 1, y: 2 },
      b: { z: 3 },
    }
    const obj2 = {
      a: { y: 4, w: 5 },
      b: { z: 6 },
    }
    expect(deepMerge<any>(obj1, obj2)).toEqual({
      a: { x: 1, y: 4, w: 5 },
      b: { z: 6 },
    })
  })

  test("handles multiple levels of nesting", () => {
    const obj1 = {
      level1: {
        level2: {
          level3: { a: 1 },
        },
      },
    }
    const obj2 = {
      level1: {
        level2: {
          level3: { b: 2 },
        },
      },
    }
    expect(deepMerge<any>(obj1, obj2)).toEqual({
      level1: {
        level2: {
          level3: { a: 1, b: 2 },
        },
      },
    })
  })

  test("preserves unmodified nested objects", () => {
    const obj1 = {
      unchanged: { a: 1 },
      changed: { b: 2 },
    }
    const obj2 = {
      changed: { c: 3 },
    }
    expect(deepMerge<any>(obj1, obj2)).toEqual({
      unchanged: { a: 1 },
      changed: { b: 2, c: 3 },
    })
  })

  test("handles mixed nested and flat properties", () => {
    const obj1 = {
      flat: 1,
      nested: { a: 2 },
    }
    const obj2 = {
      flat: 3,
      nested: { b: 4 },
    }
    expect(deepMerge<any>(obj1, obj2)).toEqual({
      flat: 3,
      nested: { a: 2, b: 4 },
    })
  })

  test("handles mixed object and primitive values", () => {
    const obj1 = {
      key: "string value",
      another: { nested: true },
    }
    const obj2 = {
      key: { foo: "bar" },
      another: 42,
    }
    expect(deepMerge<any>(obj1, obj2)).toEqual({
      key: { foo: "bar" },
      another: 42,
    })
  })

  test("handles mixed primitive and object values (reverse case)", () => {
    const obj1 = {
      key: { foo: "bar" },
      another: 42,
    }
    const obj2 = {
      key: "string value",
      another: { nested: true },
    }
    expect(deepMerge<any>(obj1, obj2)).toEqual({
      key: "string value",
      another: { nested: true },
    })
  })

  test("handles undefined values", () => {
    const obj1 = {
      a: 1,
      b: undefined,
      c: { d: undefined },
    }
    const obj2 = {
      b: 2,
      c: { d: 3 },
    }
    expect(deepMerge<any>(obj1, obj2)).toEqual({
      a: 1,
      b: 2,
      c: { d: 3 },
    })
  })

  test("ignores undefined objects in merge", () => {
    const obj1 = {
      a: 1,
      b: { c: 2 },
    }
    const obj2 = undefined
    expect(deepMerge<any>(obj1, obj2)).toEqual({
      a: 1,
      b: { c: 2 },
    })
  })

  test("handles undefined nested objects", () => {
    const obj1 = {
      a: { b: { d: 1 } },
      c: { e: 2 },
    }
    const obj2 = {
      a: { b: undefined },
      c: undefined,
    }
    expect(deepMerge<any>(obj1, obj2)).toEqual({
      a: { b: { d: 1 } },
      c: { e: 2 },
    })
  })

  test("handles objects with functions", () => {
    const fn1 = () => "hello"
    const fn2 = () => "world"

    const obj1 = {
      a: fn1,
      b: { c: fn1 },
    }

    const obj2 = {
      a: fn2,
      b: { c: fn2 },
    }

    const result = deepMerge<any>(obj1, obj2)

    expect(result.a).toBe(fn2)
    expect(result.b.c).toBe(fn2)
  })
})

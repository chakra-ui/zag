import { describe, expect, test } from "vitest"
import { compact, splitProps } from "../src"

describe("compact()", () => {
  test("should compact object", () => {
    const obj = {
      a: 1,
      b: undefined,
      c: {
        d: 2,
        e: undefined,
      },
    }

    const expected = {
      a: 1,
      c: {
        d: 2,
      },
    }

    expect(compact(obj)).toEqual(expected)
  })

  test("should preserve null", () => {
    const obj = {
      a: 1,
      b: null,
      c: {
        d: 2,
        e: null,
      },
    }

    const expected = {
      a: 1,
      b: null,
      d: undefined,
      c: {
        d: 2,
        e: null,
      },
    }

    expect(compact(obj)).toEqual(expected)
  })
})

describe("splitProps()", () => {
  test("should split props into result and rest", () => {
    const props = { a: 1, b: 2, c: 3 }
    const [result, rest] = splitProps(props, ["a", "c"])

    expect(result).toEqual({ a: 1, c: 3 })
    expect(rest).toEqual({ b: 2 })
  })

  test("should handle missing keys gracefully", () => {
    const props = { a: 1 }
    const [result, rest] = splitProps(props, ["b" as keyof typeof props])

    expect(result).toEqual({})
    expect(rest).toEqual({ a: 1 })
  })

  test("should perserve symbol keys", () => {
    const symA = Symbol("a")
    const symB = Symbol("b")
    const props = { [symA]: 1, [symB]: 2, c: 3 }
    const [result, rest] = splitProps(props, [symA, "c"])
    expect(result).toEqual({ [symA]: 1, c: 3 })
    expect(rest).toEqual({ [symB]: 2 })
  })
})

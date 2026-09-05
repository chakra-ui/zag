import { describe, expect, test } from "vitest"
import { compact, mergeWithDefault, splitProps } from "../src"

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
  test("should split props", () => {
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

describe("mergeWithDefault()", () => {
  test("keeps defaults when overrides are omitted", () => {
    const result = mergeWithDefault({ timeout: 3000, label: "Copy" }, undefined)
    expect(result).toEqual({ timeout: 3000, label: "Copy" })
  })

  test("does not let undefined wipe a default", () => {
    const result = mergeWithDefault({ timeout: 3000, label: "Copy" }, { timeout: undefined, label: "Copied" })
    expect(result).toEqual({ timeout: 3000, label: "Copied" })
  })

  test("keeps override keys that are not in the defaults", () => {
    const result = mergeWithDefault({ loopFocus: false }, { loopFocus: true, id: "select", disabled: undefined })
    expect(result).toEqual({ loopFocus: true, id: "select" })
  })
})

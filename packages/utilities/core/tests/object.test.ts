import { describe, expect, test } from "vitest"
import { compact } from "../src"

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

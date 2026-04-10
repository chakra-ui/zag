import { describe, expect, test } from "vitest"
import { parseColor } from "../src"

describe("color.test.ts", () => {
  test("decrement", () => {
    const color = parseColor("#361717").toFormat("hsla")

    expect(color).toMatchInlineSnapshot(`
      {
        "a": 1,
        "h": 0,
        "l": 15.1,
        "s": 40.26,
      }
    `)

    expect(color.decrementChannel("saturation", 1)).toMatchInlineSnapshot(`
      {
        "a": 1,
        "h": 0,
        "l": 15.1,
        "s": 39,
      }
    `)

    expect(color.decrementChannel("lightness", 1)).toMatchInlineSnapshot(`
      {
        "a": 1,
        "h": 0,
        "l": 14,
        "s": 40.26,
      }
    `)
  })

  test("oklch parse and css output", () => {
    const c = parseColor("oklch(0.65 0.15 250)")
    expect(c.getFormat()).toBe("oklch")
    expect(c.toString("oklch")).toMatch(/oklch\(/)
  })

  test("hexint", () => {
    expect(parseColor("hsl(0, 92%, 13%)")).toMatchInlineSnapshot(`
      {
        "a": 1,
        "h": 0,
        "l": 13,
        "s": 92,
      }
    `)

    expect(parseColor("hsl(0, 76%, 31%)")).toMatchInlineSnapshot(`
      {
        "a": 1,
        "h": 0,
        "l": 31,
        "s": 76,
      }
    `)
  })
})

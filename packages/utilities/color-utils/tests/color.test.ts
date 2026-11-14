import { describe, expect, test } from "vitest"
import { parseColor } from "../src"

describe("color.test.ts", () => {
  test.each([
    ["rgb(10%, 20%, 30%)", "hex", "#1A334D"],
    ["rgba(255, 0, 0, 50%)", "rgba", "rgba(255, 0, 0, 0.5)"],
    ["rgb(10.5, 20, 30)", "hex", "#0B141E"],
    ["rgba(127.5, 127.5, 127.5, 0.5)", "hexa", "#80808080"],
  ] as const)("serializes %s as %s", (value, format, expected) => {
    expect(parseColor(value).toString(format)).toBe(expected)
  })

  test.each(["rgb(10px, 20, 30)", "rgb(10, , 30)", "rgba(10, 20, 30, invalid)"])(
    "rejects invalid RGB component values in %s",
    (value) => {
      expect(() => parseColor(value)).toThrow("Invalid color value")
    },
  )

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

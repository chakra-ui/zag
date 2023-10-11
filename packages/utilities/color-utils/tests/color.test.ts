import { describe, expect, test } from "vitest"
import { parseColor } from "../src"

describe("color.test.ts", () => {
  test("decrement", () => {
    const color = parseColor("#361717").toFormat("hsl")

    expect(color).toMatchInlineSnapshot(`
      HSLColor {
        "alpha": 1,
        "hue": 0,
        "lightness": 15.1,
        "saturation": 40.26,
      }
    `)

    expect(color.decrementChannel("saturation", 1)).toMatchInlineSnapshot(`
      HSLColor {
        "alpha": 1,
        "hue": 0,
        "lightness": 15.1,
        "saturation": 39,
      }
    `)

    expect(color.decrementChannel("lightness", 1)).toMatchInlineSnapshot(`
      HSLColor {
        "alpha": 1,
        "hue": 0,
        "lightness": 14,
        "saturation": 40.26,
      }
    `)
  })

  test("hexint", () => {
    expect(parseColor("hsl(0, 92%, 13%)")).toMatchInlineSnapshot(`
      HSLColor {
        "alpha": 1,
        "hue": 0,
        "lightness": 13,
        "saturation": 92,
      }
    `)

    expect(parseColor("hsl(0, 76%, 31%)")).toMatchInlineSnapshot(`
      HSLColor {
        "alpha": 1,
        "hue": 0,
        "lightness": 31,
        "saturation": 76,
      }
    `)
  })
})

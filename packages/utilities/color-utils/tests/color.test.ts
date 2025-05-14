import { describe, expect, test } from "vitest"
import { parseColor } from "../src"
import { getValue, parseOkl } from "../src/color"

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
  test("getValue helper works", () => {
    expect(getValue("100%")).toEqual({ type: "percentage", value: 100 })
    expect(getValue("-435.65%")).toEqual({ type: "percentage", value: -435.65 })
    expect(getValue("100")).toEqual({ type: "number", value: 100 })
    expect(getValue("-34")).toEqual({ type: "number", value: -34 })
    expect(getValue("21.37")).toEqual({ type: "number", value: 21.37 })
    expect(getValue("none")).toEqual({ type: "number", value: 0 })
    expect(getValue("-34fff")).toEqual(undefined)
    expect(getValue("-34fff%")).toEqual(undefined)
    expect(getValue("-34.%")).toEqual(undefined)
  })
  test.for(["oklab", "oklch"] as const)("parsing %s works properly", (mode) => {
    const validNoAlpha = ["0.5", "100%", "237%"] as const
    const alpha = "0.5"
    const expectedNoAlpha = validNoAlpha.map(getValue)
    expect(parseOkl(createColorString(mode, validNoAlpha), mode)).toEqual(expectedNoAlpha)
    expect(parseOkl(createColorString(mode, validNoAlpha, alpha), mode)).toEqual([...expectedNoAlpha, getValue(alpha)])
    expect(parseOkl(createColorString(mode, validNoAlpha, `  ${alpha}`, "    "), mode)).toEqual([
      ...expectedNoAlpha,
      getValue(alpha),
    ])
    expect(parseOkl(createColorString("invalidMode", validNoAlpha), mode)).toEqual(undefined)
    expect(parseOkl(createColorString(mode, ["0.3434", "100%", "343/200"], alpha), mode)).toEqual(undefined)
    expect(parseOkl(createColorString(mode, ["0,3434", "100%", "100%"], alpha), mode)).toEqual(undefined)
    expect(parseOkl(createColorString(mode, ["0.3434", "100%f", "40%"], alpha), mode)).toEqual(undefined)
  })
})
const createColorString = (
  mode: string,
  values: readonly [string, string, string],
  alpha?: string,
  spaceBeforeAlpha = "",
) => `${mode}(${values.join(" ")}${alpha ? `${spaceBeforeAlpha}/${alpha}` : ""})`

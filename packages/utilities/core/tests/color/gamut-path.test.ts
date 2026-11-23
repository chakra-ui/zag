import { describe, expect, test } from "vitest"
import { getChannelThumbColor, getSrgbGamutPath, parseColor } from "../../src/color"

describe("getSrgbGamutPath", () => {
  test("traces a line in a 0-100 box", () => {
    const result = getSrgbGamutPath(0)!
    expect(result.path.startsWith("M ")).toBe(true)
    expect(result.labelPosition.y).toBe(96)
  })

  test("samples more rows on denser screens, up to 200", () => {
    // Rows darker than 1% brightness are skipped
    const points = (pixelRatio: number) => getSrgbGamutPath(0, pixelRatio)!.path.split(" L ").length
    expect(points(1)).toBe(80)
    expect(points(2)).toBe(159)
    expect(points(100)).toBe(199)
    expect(points(0.5)).toBe(points(1))
  })
})

describe("getChannelThumbColor", () => {
  const color = parseColor("hsla(120, 40%, 30%, 0.5)")

  test("hue shows the full hue", () => {
    expect(getChannelThumbColor(color, "hue").toString("css")).toBe("hsla(120, 100%, 50%, 1)")
  })

  test("alpha keeps the alpha", () => {
    expect(getChannelThumbColor(color, "alpha").getChannelValue("alpha")).toBe(0.5)
  })

  test("other channels show the opaque color", () => {
    expect(getChannelThumbColor(color, "lightness").toString("css")).toBe("hsla(120, 40%, 30%, 1)")
  })

  test("oklch hue keeps its lightness and chroma", () => {
    const oklch = parseColor("oklch(0.6 0.1 200 / 0.5)")
    expect(getChannelThumbColor(oklch, "hue").toString("css")).toBe("oklch(0.6 0.1 200)")
  })
})

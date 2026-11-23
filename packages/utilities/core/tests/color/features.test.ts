import { describe, expect, test } from "vitest"
import {
  getChannelColor,
  getChannelGradient,
  getColorDistance,
  getContrastRatio,
  isInSrgbGamut,
  mixColors,
  parseColor,
  toGamut,
} from "../../src/color"

const hex = (value: string) => parseColor(value).toString("hex")

describe("color / CSS Color 4 syntax", () => {
  test("hwb() reads into HSB", () => {
    expect(hex("hwb(0 0% 0%)")).toBe("#FF0000")
    expect(hex("hwb(120 0% 50%)")).toBe("#008000")
    expect(hex("hwb(0 60% 60%)")).toBe("#808080")
    expect(parseColor("hwb(200 10% 20% / 0.5)").getFormat()).toBe("hsba")
  })

  test("color(srgb …) reads into RGB", () => {
    expect(hex("color(srgb 1 0 0)")).toBe("#FF0000")
    expect(parseColor("color(srgb 0 0.5 1 / 25%)").getChannelValue("alpha")).toBe(0.25)
  })

  test("lab(), lch() and wide-gamut color() read into OKLab and OKLCH", () => {
    // CSS lab() is CIELAB with a D50 white point, where sRGB red is about lab(54.29 80.82 69.89)
    expect(hex("lab(54.29 80.82 69.89)")).toBe("#FF0000")
    expect(parseColor("lch(50% 30 120)").getFormat()).toBe("oklch")
    const p3 = parseColor("color(display-p3 1 0 0)")
    expect(p3.getFormat()).toBe("oklab")
    expect(isInSrgbGamut(p3)).toBe(false)
  })

  test("none is a channel of 0", () => {
    expect(hex("hwb(none 0% 0%)")).toBe("#FF0000")
  })
})

describe("color / operations", () => {
  test("contrast ratio", () => {
    expect(getContrastRatio(parseColor("#fff"), parseColor("#000"))).toBeCloseTo(21, 5)
    expect(getContrastRatio(parseColor("#777"), parseColor("#777"))).toBe(1)
  })

  test("distance", () => {
    expect(getColorDistance(parseColor("red"), parseColor("red"))).toBe(0)
    expect(getColorDistance(parseColor("#000"), parseColor("#fff"))).toBeCloseTo(1, 4)
  })

  test("mixing goes the short way around the hue wheel by default", () => {
    const mix = mixColors(parseColor("hsl(350, 100%, 50%)"), parseColor("hsl(10, 100%, 50%)"), 0.5, { format: "hsla" })
    expect(mix.getChannelValue("hue")).toBeCloseTo(0, 6)
    const longer = mixColors(parseColor("hsl(350, 100%, 50%)"), parseColor("hsl(10, 100%, 50%)"), 0.5, {
      format: "hsla",
      hue: "longer",
    })
    expect(longer.getChannelValue("hue")).toBeCloseTo(180, 6)
  })

  test("mixing premultiplies alpha", () => {
    const mix = mixColors(parseColor("rgba(255, 0, 0, 1)"), parseColor("rgba(0, 0, 255, 0)"), 0.5, { format: "rgba" })
    expect(mix.getChannelValue("alpha")).toBe(0.5)
    expect(mix.getChannelValue("red")).toBe(255)
  })

  test("gamut mapping keeps the format and lands inside sRGB", () => {
    const vivid = parseColor("oklch(0.7 0.4 150)")
    const mapped = toGamut(vivid)
    expect(mapped.getFormat()).toBe("oklch")
    expect(isInSrgbGamut(mapped)).toBe(true)
    // The search keeps the hue; the final clip can move it a few degrees
    expect(Math.abs(mapped.getChannelValue("hue") - 150)).toBeLessThan(5)
    const inside = parseColor("oklch(0.6 0.05 150)")
    expect(toGamut(inside)).toBe(inside)
  })

  test("gamut mapping to P3 keeps more chroma than sRGB", () => {
    const vivid = parseColor("oklch(0.7 0.4 150)")
    const srgb = toGamut(vivid, "srgb").getChannelValue("chroma")
    const p3 = toGamut(vivid, "p3").getChannelValue("chroma")
    expect(p3).toBeGreaterThan(srgb)
    expect(p3).toBeLessThan(0.4)

    const p3Green = parseColor("color(display-p3 0 1 0)").toFormat("oklch")
    expect(toGamut(p3Green, "p3")).toBe(p3Green)
    expect(isInSrgbGamut(toGamut(p3Green, "srgb"))).toBe(true)
  })
})

describe("color / channels", () => {
  test("getChannelColor finds the space that has a channel", () => {
    expect(getChannelColor(parseColor("hsl(0, 100%, 50%)"), "red").getFormat()).toBe("rgba")
    expect(getChannelColor(parseColor("oklch(0.6 0.1 20)"), "saturation").getFormat()).toBe("hsba")
    expect(getChannelColor(parseColor("hsl(0, 100%, 50%)"), "saturation").getFormat()).toBe("hsla")
    const color = parseColor("#f00")
    expect(getChannelColor(color, "alpha")).toBe(color)
  })

  test("getChannelGradient spans the channel's range", () => {
    expect(getChannelGradient(parseColor("rgb(10, 20, 30)"), "red", "right")).toBe(
      "linear-gradient(to right, rgba(0, 20, 30, 1), rgba(255, 20, 30, 1))",
    )
  })
})

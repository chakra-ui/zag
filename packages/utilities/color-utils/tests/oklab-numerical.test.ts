import { describe, expect, test } from "vitest"
import { parseColor } from "../src"
import {
  isLinearRgbInSrgbGamut,
  linearRgbToOklab,
  oklabToLinearRgb,
  oklabToOklch,
  oklchToOklab,
  srgbToLinearRgb,
} from "../src/oklab-math"

/** Max abs error allowed for linear RGB round-trip through OKLab (cube roots + matrix). */
const LINEAR_EPS = 2e-5

function expectLinearRgbClose(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  expect(a.r).toBeCloseTo(b.r, 4)
  expect(a.g).toBeCloseTo(b.g, 4)
  expect(a.b).toBeCloseTo(b.b, 4)
}

describe("oklab-math numerical correctness", () => {
  test("linear RGB ↔ OKLab round-trip (grid)", () => {
    const steps = [0, 0.25, 0.5, 0.75, 1]
    for (const r of steps) {
      for (const g of steps) {
        for (const b of steps) {
          const lin = { r, g, b }
          const o = linearRgbToOklab(lin)
          const back = oklabToLinearRgb(o.L, o.a, o.b)
          expect(Math.abs(back.r - r)).toBeLessThan(LINEAR_EPS)
          expect(Math.abs(back.g - g)).toBeLessThan(LINEAR_EPS)
          expect(Math.abs(back.b - b)).toBeLessThan(LINEAR_EPS)
        }
      }
    }
  })

  test("OKLab ↔ OKLCH round-trip (chroma > 0)", () => {
    const cases: [number, number, number][] = [
      [0.65, 0.15, 250],
      [0.4, 0.2, 90],
      [0.8, 0.05, 12.5],
      [0.2, 0.1, 180],
    ]
    for (const [L, C, H] of cases) {
      const o = oklchToOklab(L, C, H)
      const { L: L2, C: C2, H: H2 } = oklabToOklch(o.L, o.a, o.b)
      expect(L2).toBeCloseTo(L, 10)
      expect(C2).toBeCloseTo(C, 10)
      expect(H2).toBeCloseTo(H, 10)
    }
  })

  /**
   * Goldens: independent Python (CSS Color 4 / Björn Ottosson matrices),
   * linear sRGB in [0,1]³ → OKLab.
   */
  test("forward OKLab matches reference values (linear RGB primaries)", () => {
    const red: [number, number, number] = [1, 0, 0]
    const green: [number, number, number] = [0, 1, 0]
    const blue: [number, number, number] = [0, 0, 1]
    const white: [number, number, number] = [1, 1, 1]
    const midGray: [number, number, number] = [0.5, 0.5, 0.5]

    const oRed = linearRgbToOklab({ r: red[0], g: red[1], b: red[2] })
    expect(oRed.L).toBeCloseTo(0.6279553606145516, 10)
    expect(oRed.a).toBeCloseTo(0.22486306106597398, 10)
    expect(oRed.b).toBeCloseTo(0.1258462985307351, 10)

    const oGreen = linearRgbToOklab({ r: green[0], g: green[1], b: green[2] })
    expect(oGreen.L).toBeCloseTo(0.8664396115356694, 10)
    expect(oGreen.a).toBeCloseTo(-0.23388757418790818, 10)
    expect(oGreen.b).toBeCloseTo(0.17949847989672985, 10)

    const oBlue = linearRgbToOklab({ r: blue[0], g: blue[1], b: blue[2] })
    expect(oBlue.L).toBeCloseTo(0.4520137183853429, 10)
    expect(oBlue.a).toBeCloseTo(-0.03245698416876397, 10)
    expect(oBlue.b).toBeCloseTo(-0.3115281476783751, 10)

    const oWhite = linearRgbToOklab({ r: white[0], g: white[1], b: white[2] })
    expect(oWhite.L).toBeCloseTo(0.9999999934735462, 7)
    expect(oWhite.a).toBeCloseTo(0, 6)
    expect(oWhite.b).toBeCloseTo(0, 6)

    const oMid = linearRgbToOklab({ r: midGray[0], g: midGray[1], b: midGray[2] })
    expect(oMid.L).toBeCloseTo(0.7937005208040498, 10)
    expect(oMid.a).toBeCloseTo(0, 6)
    expect(oMid.b).toBeCloseTo(0, 6)
  })

  test("RGBColor.toFormat('oklab') matches linearRgbToOklab(srgbToLinearRgb)", () => {
    const samples: [number, number, number][] = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 128, 255],
      [128, 128, 128],
    ]
    for (const [r, g, b] of samples) {
      const lin = srgbToLinearRgb(r, g, b)
      const direct = linearRgbToOklab(lin)
      const viaColor = parseColor(`rgba(${r}, ${g}, ${b}, 1)`).toFormat("oklab")
      expect(viaColor.getChannelValue("lightness")).toBeCloseTo(direct.L, 10)
      expect(viaColor.getChannelValue("a")).toBeCloseTo(direct.a, 10)
      expect(viaColor.getChannelValue("b")).toBeCloseTo(direct.b, 10)
    }
  })

  test("parseColor ↔ toString round-trip (oklab / oklch)", () => {
    const oklabStr = "oklab(0.452 0.12 -0.08 / 1)"
    const c1 = parseColor(oklabStr)
    expect(c1.getFormat()).toBe("oklab")
    const again1 = parseColor(c1.toString("oklab"))
    expect(c1.isEqual(again1)).toBe(true)

    const oklchStr = "oklch(0.65 0.12 200 / 1)"
    const c2 = parseColor(oklchStr)
    expect(c2.getFormat()).toBe("oklch")
    const again2 = parseColor(c2.toString("oklch"))
    expect(c2.isEqual(again2)).toBe(true)
  })

  test("rgba ↔ oklch ↔ rgba preserves sRGB-safe colors (within clamp)", () => {
    const hex = "#3b82f6"
    const rgb = parseColor(hex).toFormat("rgba")
    const oklch = rgb.toFormat("oklch")
    const back = oklch.toFormat("rgba")
    expectLinearRgbClose(
      { r: rgb.getChannelValue("red"), g: rgb.getChannelValue("green"), b: rgb.getChannelValue("blue") },
      { r: back.getChannelValue("red"), g: back.getChannelValue("green"), b: back.getChannelValue("blue") },
    )
  })

  test("isLinearRgbInSrgbGamut", () => {
    expect(isLinearRgbInSrgbGamut({ r: 0.5, g: 0.5, b: 0.5 })).toBe(true)
    expect(isLinearRgbInSrgbGamut({ r: 0, g: 0, b: 0 })).toBe(true)
    expect(isLinearRgbInSrgbGamut({ r: 1, g: 1, b: 1 })).toBe(true)
    expect(isLinearRgbInSrgbGamut({ r: 1.5, g: 0, b: 0 })).toBe(false)
    expect(isLinearRgbInSrgbGamut({ r: -0.01, g: 0, b: 0 })).toBe(false)
  })
})

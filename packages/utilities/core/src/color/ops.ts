// Operations on any color, as standalone functions so a bundle keeps only the ones it uses.
import { clampValue, mod } from "../number"
import { ColorValue } from "./color"
import { clamp01, fromLinear, linearRgbToOklab, oklabToLinearRgb, oklchToOklab, toLinear, type Vec3 } from "./math"
import type { ColorFormat, ColorType } from "./types"

const valuesOf = (color: ColorType) => color.getChannels().map((c) => color.getChannelValue(c)) as Vec3
const oklabOf = (color: ColorType) => valuesOf(color.toFormat("oklab"))
const distance = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

/** How different two colors look (ΔEOK). About 0.02 is the smallest difference most people notice. */
export const getColorDistance = (a: ColorType, b: ColorType) => distance(oklabOf(a), oklabOf(b))

// Relative luminance: the Y row of linear sRGB to XYZ
const luminance = (color: ColorType) => {
  const [r, g, b] = oklabToLinearRgb(oklabOf(color))
  return Math.max(0, (87098 / 409605) * r + (175762 / 245763) * g + (12673 / 175545) * b)
}

/** The WCAG 2 contrast ratio of two colors, from 1 to 21. Text needs 4.5 (AA) against its background. */
export const getContrastRatio = (a: ColorType, b: ColorType) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export type HueInterpolation = "shorter" | "longer" | "increasing" | "decreasing"

export interface MixColorsOptions {
  /** The space to mix in, like CSS `color-mix(in …)`. @default "oklab" */
  format?: ColorFormat | undefined
  /** Which way hues go around the wheel. @default "shorter" */
  hue?: HueInterpolation | undefined
}

// Where the hue sits in each space's values
const HUE_INDEX: Partial<Record<ColorFormat, number>> = { hsla: 0, hsba: 0, oklch: 1 }

/** Adjusts two hues so interpolating between them goes the way `method` asks (CSS Color 4) */
function fixHues(a: number, b: number, method: HueInterpolation) {
  const d = b - a
  if (method === "shorter") d > 180 ? (a += 360) : d < -180 && (b += 360)
  else if (method === "longer") d > 0 && d < 180 ? (a += 360) : d > -180 && d <= 0 && (b += 360)
  else if (method === "increasing") d < 0 && (b += 360)
  else d > 0 && (a += 360)
  return [a, b]
}

/** Mixes `amount` of `b` into `a`, like CSS `color-mix()`, with alpha premultiplied */
export function mixColors(a: ColorType, b: ColorType, amount = 0.5, options: MixColorsOptions = {}): ColorType {
  const { format = "oklab", hue = "shorter" } = options
  const t = clampValue(amount, 0, 1)
  const [x, y] = [a, b].map((c) => c.toFormat(format))
  const [ax, ay] = [x, y].map((c) => c.getChannelValue("alpha"))
  const alpha = ax + (ay - ax) * t
  const [vx, vy] = [x, y].map(valuesOf)
  const values = vx.map((from, i) => {
    const to = vy[i]
    if (i === HUE_INDEX[format]) {
      const [h1, h2] = fixHues(mod(from, 360), mod(to, 360), hue)
      return mod(h1 + (h2 - h1) * t, 360)
    }
    if (alpha === 0) return from + (to - from) * t
    return (from * ax + (to * ay - from * ax) * t) / alpha
  }) as Vec3
  return new ColorValue(format, values, alpha)
}

const JND = 0.02
const EPSILON = 0.0001
// How far past an edge still counts as inside, so round-trips don't fall out of gamut
const TOLERANCE = 0.000075

const toSrgb = (lab: Vec3) => oklabToLinearRgb(lab).map(fromLinear) as Vec3
const inSrgb = (rgb: Vec3) => rgb.every((v) => v >= -TOLERANCE && v <= 1 + TOLERANCE)
const clip = (rgb: Vec3) => rgb.map(clamp01) as Vec3
const labOfSrgb = (rgb: Vec3) => linearRgbToOklab(rgb.map(toLinear) as Vec3)

/** The color itself when it fits sRGB, or the closest color that does, in the color's own format (CSS Color 4) */
export function toSrgbGamut(color: ColorType): ColorType {
  const format = color.getFormat()
  const alpha = color.getChannelValue("alpha")
  const [L, H, C] = valuesOf(color.toFormat("oklch"))
  const result = (rgb: Vec3) => new ColorValue("oklab", labOfSrgb(rgb), alpha).toFormat(format)

  if (L >= 1) return result([1, 1, 1])
  if (L <= 0) return result([0, 0, 0])
  const at = (chroma: number) => oklchToOklab([L, chroma, H])
  if (inSrgb(toSrgb(at(C)))) return color

  let clipped = clip(toSrgb(at(C)))
  if (distance(labOfSrgb(clipped), at(C)) < JND) return result(clipped)

  let min = 0
  let max = C
  let minInGamut = true
  while (max - min > EPSILON) {
    const chroma = (min + max) / 2
    const current = at(chroma)
    if (minInGamut && inSrgb(toSrgb(current))) {
      min = chroma
      continue
    }
    clipped = clip(toSrgb(current))
    const e = distance(labOfSrgb(clipped), current)
    if (e >= JND) max = chroma
    else if (JND - e < EPSILON) break
    else {
      minInGamut = false
      min = chroma
    }
  }
  return result(clipped)
}

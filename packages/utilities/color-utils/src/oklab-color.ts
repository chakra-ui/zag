import { clampValue, mod, toFixedNumber } from "@zag-js/utils"
import { Color } from "./color"
import { HSBColor } from "./hsb-color"
import { RGBColor } from "./rgb-color"
import { linearChannelToSrgb, linearRgbToSrgb, oklabToLinearRgb, oklabToOklch, oklchToOklab } from "./oklab-math"
import type { ColorChannel, ColorChannelRange, ColorFormat, ColorStringFormat, ColorType } from "./types"

/** Convert oklab → HSB via float sRGB (avoids integer 0-255 precision loss). */
function oklabToHsb(L: number, a: number, b: number, alpha: number): ColorType {
  const lin = oklabToLinearRgb(L, a, b)
  return HSBColor.fromSrgbFloat(
    linearChannelToSrgb(lin.r),
    linearChannelToSrgb(lin.g),
    linearChannelToSrgb(lin.b),
    alpha,
  )
}

const OKLAB_HEAD = /^oklab\(\s*/i

function parseCssNumber(token: string): number | undefined {
  const t = token.trim().toLowerCase()
  if (t === "none") return undefined
  if (t.endsWith("%")) return Number.parseFloat(t) / 100
  const n = Number.parseFloat(t)
  return Number.isFinite(n) ? n : undefined
}

/** Parse `oklab(L a b)` / `oklab(L a b / alpha)` body (inside parentheses). */
export function parseOklabParams(inner: string): { L: number; a: number; b: number; alpha: number } | void {
  const [main, alphaPart] = inner.split(/\s*\/\s*/)
  const tokens = main.trim().split(/\s+/).filter(Boolean)
  if (tokens.length < 3) return

  const L = parseCssNumber(tokens[0]!)
  const a = parseCssNumber(tokens[1]!)
  const b = parseCssNumber(tokens[2]!)
  if (L === undefined || a === undefined || b === undefined) return

  let alpha = 1
  if (alphaPart) {
    const at = alphaPart.trim().toLowerCase()
    if (at !== "none") {
      const av = at.endsWith("%") ? Number.parseFloat(at) / 100 : Number.parseFloat(at)
      if (Number.isFinite(av)) alpha = clampValue(av, 0, 1)
    }
  }

  return { L: clampValue(L, 0, 1), a, b, alpha }
}

export class OklabColor extends Color {
  constructor(
    private lightness: number,
    private a: number,
    private b: number,
    private alpha: number,
  ) {
    super()
  }

  static parse(value: string): OklabColor | void {
    if (!OKLAB_HEAD.test(value)) return
    const end = value.lastIndexOf(")")
    if (end < 0) return
    const inner = value.slice(value.indexOf("(") + 1, end)
    const p = parseOklabParams(inner)
    if (!p) return
    return new OklabColor(p.L, p.a, p.b, p.alpha)
  }

  toString(format: ColorStringFormat = "css"): string {
    switch (format) {
      case "hex":
        return this.toFormat("rgba").toString("hex")
      case "hexa":
        return this.toFormat("rgba").toString("hexa")
      case "oklab":
        return formatOklabCss(this.lightness, this.a, this.b, this.alpha)
      case "css":
        return formatOklabCss(this.lightness, this.a, this.b, this.alpha)
      default:
        return this.toFormat(format as ColorFormat).toString(format)
    }
  }

  toFormat(format: ColorFormat): ColorType {
    switch (format) {
      case "oklab":
        return this
      case "oklch":
        return this.toOklch()
      case "rgba":
        return this.toRgb()
      case "hsla":
        return this.toRgb().toFormat("hsla")
      case "hsba":
        return oklabToHsb(this.lightness, this.a, this.b, this.alpha)
      default:
        throw new Error("Unsupported color conversion: oklab -> " + format)
    }
  }

  private toRgb(): RGBColor {
    const { r, g, b } = linearRgbToSrgb(oklabToLinearRgb(this.lightness, this.a, this.b))
    return new RGBColor(r, g, b, toFixedNumber(this.alpha, 4))
  }

  private toOklch(): OklchColor {
    const { L, C, H } = oklabToOklch(this.lightness, this.a, this.b)
    return new OklchColor(L, H, C, toFixedNumber(this.alpha, 4))
  }

  clone(): ColorType {
    return new OklabColor(this.lightness, this.a, this.b, this.alpha)
  }

  getChannelValue(channel: ColorChannel): number {
    switch (channel) {
      case "lightness":
        return this.lightness
      case "a":
        return this.a
      case "b":
        return this.b
      case "alpha":
        return this.alpha
      default:
        throw new Error("Unsupported color channel: " + channel)
    }
  }

  withChannelValue(channel: ColorChannel, value: number): ColorType {
    const { minValue, maxValue } = this.getChannelRange(channel)
    const v = clampValue(value, minValue, maxValue)
    switch (channel) {
      case "lightness":
        return new OklabColor(v, this.a, this.b, this.alpha)
      case "a":
        return new OklabColor(this.lightness, v, this.b, this.alpha)
      case "b":
        return new OklabColor(this.lightness, this.a, v, this.alpha)
      case "alpha":
        return new OklabColor(this.lightness, this.a, this.b, v)
      default:
        throw new Error("Unsupported color channel: " + channel)
    }
  }

  formatChannelValue(channel: ColorChannel, locale: string): string {
    const options = this.getChannelFormatOptions(channel)
    const val = this.getChannelValue(channel)
    return new Intl.NumberFormat(locale, options).format(val)
  }

  private getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    switch (channel) {
      case "lightness":
      case "a":
      case "b":
      case "alpha":
        return { style: "decimal", maximumFractionDigits: 4 }
      default:
        throw new Error("Unknown color channel: " + channel)
    }
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "lightness":
        return { minValue: 0, maxValue: 1, step: 0.001, pageSize: 0.05 }
      case "a":
      case "b":
        return { minValue: -0.4, maxValue: 0.4, step: 0.001, pageSize: 0.02 }
      case "alpha":
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 }
      default:
        throw new Error("Unknown color channel: " + channel)
    }
  }

  toJSON(): Record<string, number> {
    return { l: this.lightness, a: this.a, b: this.b, alpha: this.alpha }
  }

  getFormat(): ColorFormat {
    return "oklab"
  }

  private static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = ["lightness", "a", "b"]

  getChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return OklabColor.colorChannels
  }

  isEqual(color: ColorType): boolean {
    if (color.getFormat() !== "oklab") return super.isEqual(color)
    const o = color as OklabColor
    return this.lightness === o.lightness && this.a === o.a && this.b === o.b && this.alpha === o.alpha
  }
}

function formatOklabCss(L: number, a: number, b: number, alpha: number): string {
  const l = toFixedNumber(L, 4)
  const aa = toFixedNumber(a, 4)
  const bb = toFixedNumber(b, 4)
  if (alpha >= 1) return `oklab(${l} ${aa} ${bb})`
  return `oklab(${l} ${aa} ${bb} / ${toFixedNumber(alpha, 4)})`
}

const OKLCH_HEAD = /^oklch\(\s*/i

function parseCssNumberOrAngle(token: string): number | undefined {
  const t = token.trim().toLowerCase()
  if (t === "none") return undefined
  if (t.endsWith("deg")) return Number.parseFloat(t)
  if (t.endsWith("turn")) return Number.parseFloat(t) * 360
  if (t.endsWith("grad")) return (Number.parseFloat(t) / 400) * 360
  if (t.endsWith("rad")) return (Number.parseFloat(t) * 180) / Math.PI
  if (t.endsWith("%")) return Number.parseFloat(t) / 100
  const n = Number.parseFloat(t)
  return Number.isFinite(n) ? n : undefined
}

export function parseOklchParams(inner: string): { L: number; C: number; H: number; alpha: number } | void {
  const [main, alphaPart] = inner.split(/\s*\/\s*/)
  const tokens = main.trim().split(/\s+/).filter(Boolean)
  if (tokens.length < 3) return

  const Lraw = parseCssNumberOrAngle(tokens[0]!)
  const Craw = parseCssNumberOrAngle(tokens[1]!)
  const Hraw = parseCssNumberOrAngle(tokens[2]!)
  if (Lraw === undefined || Craw === undefined || Hraw === undefined) return

  const L = tokens[0]!.trim().endsWith("%") ? Lraw : clampValue(Lraw, 0, 1)
  const C = tokens[1]!.trim().endsWith("%") ? Craw * 0.5 : Craw
  const H = mod(Hraw, 360)

  let alpha = 1
  if (alphaPart) {
    const at = alphaPart.trim().toLowerCase()
    if (at !== "none") {
      const av = at.endsWith("%") ? Number.parseFloat(at) / 100 : Number.parseFloat(at)
      if (Number.isFinite(av)) alpha = clampValue(av, 0, 1)
    }
  }

  return { L, C: clampValue(C, 0, 0.5), H, alpha }
}

export class OklchColor extends Color {
  constructor(
    private lightness: number,
    private hue: number,
    private chroma: number,
    private alpha: number,
  ) {
    super()
  }

  static parse(value: string): OklchColor | void {
    if (!OKLCH_HEAD.test(value)) return
    const end = value.lastIndexOf(")")
    if (end < 0) return
    const inner = value.slice(value.indexOf("(") + 1, end)
    const p = parseOklchParams(inner)
    if (!p) return
    return new OklchColor(p.L, p.H, p.C, p.alpha)
  }

  toString(format: ColorStringFormat = "css"): string {
    switch (format) {
      case "hex":
        return this.toFormat("rgba").toString("hex")
      case "hexa":
        return this.toFormat("rgba").toString("hexa")
      case "oklch":
        return formatOklchCss(this.lightness, this.chroma, this.hue, this.alpha)
      case "css":
        return formatOklchCss(this.lightness, this.chroma, this.hue, this.alpha)
      default:
        return this.toFormat(format as ColorFormat).toString(format)
    }
  }

  toFormat(format: ColorFormat): ColorType {
    switch (format) {
      case "oklch":
        return this
      case "oklab":
        return this.toOklab()
      case "rgba":
        return this.toRgb()
      case "hsla":
        return this.toRgb().toFormat("hsla")
      case "hsba": {
        const { a, b, L } = oklchToOklab(this.lightness, this.chroma, this.hue)
        return oklabToHsb(L, a, b, this.alpha)
      }
      default:
        throw new Error("Unsupported color conversion: oklch -> " + format)
    }
  }

  private toOklab(): OklabColor {
    const { a, b, L } = oklchToOklab(this.lightness, this.chroma, this.hue)
    return new OklabColor(L, a, b, toFixedNumber(this.alpha, 4))
  }

  private toRgb(): RGBColor {
    return this.toOklab().toFormat("rgba") as RGBColor
  }

  clone(): ColorType {
    return new OklchColor(this.lightness, this.hue, this.chroma, this.alpha)
  }

  getChannelValue(channel: ColorChannel): number {
    switch (channel) {
      case "lightness":
        return this.lightness
      case "hue":
        return this.hue
      case "chroma":
        return this.chroma
      case "alpha":
        return this.alpha
      default:
        throw new Error("Unsupported color channel: " + channel)
    }
  }

  withChannelValue(channel: ColorChannel, value: number): ColorType {
    const { minValue, maxValue } = this.getChannelRange(channel)
    let v = clampValue(value, minValue, maxValue)
    if (channel === "hue") v = mod(v, 360)
    switch (channel) {
      case "lightness":
        return new OklchColor(v, this.hue, this.chroma, this.alpha)
      case "hue":
        return new OklchColor(this.lightness, v, this.chroma, this.alpha)
      case "chroma":
        return new OklchColor(this.lightness, this.hue, v, this.alpha)
      case "alpha":
        return new OklchColor(this.lightness, this.hue, this.chroma, v)
      default:
        throw new Error("Unsupported color channel: " + channel)
    }
  }

  formatChannelValue(channel: ColorChannel, locale: string): string {
    const options = this.getChannelFormatOptions(channel)
    const val = this.getChannelValue(channel)
    return new Intl.NumberFormat(locale, options).format(val)
  }

  private getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    switch (channel) {
      case "lightness":
      case "chroma":
      case "alpha":
        return { style: "decimal", maximumFractionDigits: 4 }
      case "hue":
        return { style: "unit", unit: "degree", unitDisplay: "narrow" }
      default:
        throw new Error("Unknown color channel: " + channel)
    }
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "lightness":
        return { minValue: 0, maxValue: 1, step: 0.001, pageSize: 0.05 }
      case "hue":
        return { minValue: 0, maxValue: 360, step: 0.01, pageSize: 15 }
      case "chroma":
        return { minValue: 0, maxValue: 0.5, step: 0.001, pageSize: 0.02 }
      case "alpha":
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 }
      default:
        throw new Error("Unknown color channel: " + channel)
    }
  }

  toJSON(): Record<string, number> {
    return { l: this.lightness, h: this.hue, c: this.chroma, alpha: this.alpha }
  }

  getFormat(): ColorFormat {
    return "oklch"
  }

  private static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = ["lightness", "hue", "chroma"]

  getChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return OklchColor.colorChannels
  }

  isEqual(color: ColorType): boolean {
    if (color.getFormat() !== "oklch") return super.isEqual(color)
    const o = color as OklchColor
    return this.lightness === o.lightness && this.hue === o.hue && this.chroma === o.chroma && this.alpha === o.alpha
  }
}

function formatOklchCss(L: number, C: number, H: number, alpha: number): string {
  const l = toFixedNumber(L, 4)
  const c = toFixedNumber(C, 4)
  const h = toFixedNumber(H, 2)
  if (alpha >= 1) return `oklch(${l} ${c} ${h})`
  return `oklch(${l} ${c} ${h} / ${toFixedNumber(alpha, 4)})`
}

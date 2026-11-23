import { clampValue, getPercentValue, getValuePercent, mod, snapValueToStep, toFixedNumber } from "../number"
import {
  clamp01,
  fromLinear,
  linearRgbToOklab,
  oklabToLinearRgb,
  oklabToOklch,
  oklchToOklab,
  toLinear,
  type Vec3,
} from "./math"
import type {
  Color2DAxes,
  ColorAxes,
  ColorChannel,
  ColorChannelRange,
  ColorFormat,
  ColorStringFormat,
  ColorType,
} from "./types"

/** How a channel is bounded, stepped and shown */
interface ChannelSpec {
  range: ColorChannelRange
  format: Intl.NumberFormatOptions
  /** Divides the value before it's shown, like a 0-100 saturation shown as a percent */
  scale?: number
  /** Wraps the maximum back to the minimum, like a hue of 360 */
  wrap?: boolean
}

interface Space {
  /** The channels, in order */
  ch: [ColorChannel, ColorChannel, ColorChannel]
  specs: ChannelSpec[]
  /** Keys of `toJSON`, alpha last */
  json: string[]
  /** Writes the color in this space's CSS, or `undefined` for strings another space writes */
  css: (v: Vec3, alpha: number, format: ColorStringFormat) => string | undefined
}

const spec = (
  minValue: number,
  maxValue: number,
  step: number,
  pageSize: number,
  format: Intl.NumberFormatOptions,
  extra?: Partial<ChannelSpec>,
): ChannelSpec => ({
  range: { minValue, maxValue, step, pageSize },
  format,
  ...extra,
})

const PERCENT_FORMAT: Intl.NumberFormatOptions = { style: "percent" }
const OK_FORMAT: Intl.NumberFormatOptions = { style: "decimal", maximumFractionDigits: 4 }
const HUE = spec(0, 360, 1, 15, { style: "unit", unit: "degree", unitDisplay: "narrow" })
const PERCENT = spec(0, 100, 1, 10, PERCENT_FORMAT, { scale: 100 })
const ALPHA = spec(0, 1, 0.01, 0.1, PERCENT_FORMAT)
const BYTE = spec(0, 255, 1, 17, { style: "decimal" })
const OK_ALPHA = spec(0, 1, 0.01, 0.1, OK_FORMAT)
const OK_LIGHTNESS = spec(0, 1, 0.001, 0.05, OK_FORMAT)
const OK_AB = spec(-0.4, 0.4, 0.001, 0.02, OK_FORMAT)

const f2 = (v: number) => toFixedNumber(v, 2)
const f4 = (v: number) => toFixedNumber(v, 4)
const hex = (v: number) => Math.round(v).toString(16).padStart(2, "0")

/** `hsl(h, s%, l%)` and `hsb(h, s%, b%)`, with alpha for the `a` spelling and css */
const hueCss = (name: string) => (v: Vec3, alpha: number, format: ColorStringFormat) => {
  const body = `${v[0]}, ${f2(v[1])}%, ${f2(v[2])}%`
  if (format === name) return `${name}(${body})`
  if (format === name + "a" || (format === "css" && name === "hsl")) return `${name}a(${body}, ${alpha})`
}

/** `oklab(…)` and `oklch(…)`: each value is `[index, decimals]` in written order */
const okCss = (name: string, order: [number, number][]) => (v: Vec3, alpha: number, format: ColorStringFormat) => {
  if (format !== "css" && format !== name) return
  const body = order.map(([i, d]) => toFixedNumber(v[i], d)).join(" ")
  return alpha >= 1 ? `${name}(${body})` : `${name}(${body} / ${f4(alpha)})`
}

const SPACES: Record<ColorFormat, Space> = {
  rgba: {
    ch: ["red", "green", "blue"],
    specs: [BYTE, BYTE, BYTE, ALPHA],
    json: ["r", "g", "b", "a"],
    css: ([r, g, b], alpha, format) => {
      if (format === "hex" || format === "hexa") {
        return "#" + (hex(r) + hex(g) + hex(b) + (format === "hexa" ? hex(alpha * 255) : "")).toUpperCase()
      }
      if (format === "rgb") return `rgb(${r}, ${g}, ${b})`
      if (format === "css" || format === "rgba") return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },
  },
  hsla: {
    ch: ["hue", "saturation", "lightness"],
    specs: [HUE, PERCENT, PERCENT, ALPHA],
    json: ["h", "s", "l", "a"],
    css: hueCss("hsl"),
  },
  hsba: {
    ch: ["hue", "saturation", "brightness"],
    specs: [HUE, PERCENT, PERCENT, ALPHA],
    json: ["h", "s", "b", "a"],
    css: hueCss("hsb"),
  },
  oklab: {
    ch: ["lightness", "a", "b"],
    specs: [OK_LIGHTNESS, OK_AB, OK_AB, OK_ALPHA],
    json: ["l", "a", "b", "alpha"],
    css: okCss("oklab", [
      [0, 4],
      [1, 4],
      [2, 4],
    ]),
  },
  oklch: {
    ch: ["lightness", "hue", "chroma"],
    specs: [
      OK_LIGHTNESS,
      { ...HUE, range: { ...HUE.range, step: 0.01 }, wrap: true },
      spec(0, 0.5, 0.001, 0.02, OK_FORMAT),
      OK_ALPHA,
    ],
    json: ["l", "h", "c", "alpha"],
    // stored as lightness, hue, chroma; written as lightness, chroma, hue
    css: okCss("oklch", [
      [0, 4],
      [2, 4],
      [1, 2],
    ]),
  },
}

/** Strings that name a format by another of its spellings */
const FORMAT_OF: Partial<Record<ColorStringFormat, ColorFormat>> = {
  hex: "rgba",
  hexa: "rgba",
  rgb: "rgba",
  hsl: "hsla",
  hsb: "hsba",
}

const formatters = new Map<string, Intl.NumberFormat>()
const getFormatter = (locale: string, options: Intl.NumberFormatOptions) => {
  const key = locale + JSON.stringify(options)
  let formatter = formatters.get(key)
  if (!formatter) formatters.set(key, (formatter = new Intl.NumberFormat(locale, options)))
  return formatter
}

/** Hue, the smallest and largest channel, and chroma of RGB channels from 0 to 1 */
function hueOf(r: number, g: number, b: number) {
  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)
  const chroma = max - min
  let hue = 0
  if (chroma !== 0) {
    hue = max === r ? (g - b) / chroma + (g < b ? 6 : 0) : max === g ? (b - r) / chroma + 2 : (r - g) / chroma + 4
    hue /= 6
  }
  return { hue: hue * 360, min, max, chroma }
}

/** HSB from RGB channels from 0 to 1, rounded to `digits` */
function rgbToHsb(r: number, g: number, b: number, alpha: number, digits: number) {
  const { hue, max, chroma } = hueOf(r, g, b)
  const round = (v: number) => toFixedNumber(v, digits)
  return new ColorValue(
    "hsba",
    [round(hue), round(max === 0 ? 0 : (chroma / max) * 100), round(max * 100)],
    round(alpha),
  )
}

function rgbToHsl(r: number, g: number, b: number, alpha: number) {
  const { hue, min, max, chroma } = hueOf(r, g, b)
  const lightness = (max + min) / 2
  const saturation = chroma === 0 ? 0 : chroma / (lightness < 0.5 ? max + min : 2 - max - min)
  return new ColorValue("hsla", [f2(hue), f2(saturation * 100), f2(lightness * 100)], f2(alpha))
}

/** RGB from a hue color: `channel` gives each RGB channel (0-1) from its offset */
const hueToRgb = (alpha: number, channel: (n: number) => number, offsets: Vec3) =>
  new ColorValue("rgba", offsets.map((n) => Math.round(channel(n) * 255)) as Vec3, f2(alpha))

function oklabToRgb(lab: Vec3, alpha: number) {
  const rgb = oklabToLinearRgb(lab).map((c) => Math.round(clamp01(fromLinear(c)) * 255)) as Vec3
  return new ColorValue("rgba", rgb, f4(alpha))
}

// Wider than RGB's 0-255 integers, so OKLab to HSB keeps its precision
const oklabToHsb = (lab: Vec3, alpha: number) => {
  const [r, g, b] = oklabToLinearRgb(lab).map((c) => clamp01(fromLinear(c)))
  return rgbToHsb(r, g, b, alpha, 4)
}

/** Converts the values of a color in one space to another space. Each pair rounds the way it always has. */
function convert(from: ColorFormat, v: Vec3, alpha: number, to: ColorFormat): ColorType {
  switch (from) {
    case "rgba": {
      if (to === "hsba") return rgbToHsb(v[0] / 255, v[1] / 255, v[2] / 255, alpha, 2)
      if (to === "hsla") return rgbToHsl(v[0] / 255, v[1] / 255, v[2] / 255, alpha)
      const lab = new ColorValue("oklab", linearRgbToOklab(v.map((c) => toLinear(c / 255)) as Vec3), f4(alpha))
      return to === "oklab" ? lab : lab.toFormat(to)
    }
    case "hsla": {
      const [h, s, l] = [v[0], v[1] / 100, v[2] / 100]
      if (to === "hsba") {
        const brightness = l + s * Math.min(l, 1 - l)
        const saturation = brightness === 0 ? 0 : 2 * (1 - l / brightness)
        return new ColorValue("hsba", [f2(h), f2(saturation * 100), f2(brightness * 100)], f2(alpha))
      }
      const a = s * Math.min(l, 1 - l)
      const rgb = hueToRgb(
        alpha,
        (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1),
        [0, 8, 4],
      )
      return to === "rgba" ? rgb : rgb.toFormat(to)
    }
    case "hsba": {
      const [h, s, b] = [v[0], v[1] / 100, v[2] / 100]
      if (to === "hsla") {
        const lightness = b * (1 - s / 2)
        const saturation = lightness === 0 || lightness === 1 ? 0 : (b - lightness) / Math.min(lightness, 1 - lightness)
        return new ColorValue("hsla", [f2(h), f2(saturation * 100), f2(lightness * 100)], f2(alpha))
      }
      const rgb = hueToRgb(
        alpha,
        (n, k = (n + h / 60) % 6) => b - s * b * Math.max(Math.min(k, 4 - k, 1), 0),
        [5, 3, 1],
      )
      return to === "rgba" ? rgb : rgb.toFormat(to)
    }
    case "oklab": {
      if (to === "oklch") {
        const [L, C, H] = oklabToOklch(v)
        return new ColorValue("oklch", [L, H, C], f4(alpha))
      }
      if (to === "hsba") return oklabToHsb(v, alpha)
      const rgb = oklabToRgb(v, alpha)
      return to === "rgba" ? rgb : rgb.toFormat(to)
    }
    case "oklch": {
      const lab = oklchToOklab([v[0], v[2], v[1]])
      if (to === "hsba") return oklabToHsb(lab, alpha)
      const color = new ColorValue("oklab", lab, f4(alpha))
      return to === "oklab" ? color : color.toFormat(to)
    }
  }
}

/** A color in one of the supported spaces. Public as `ColorType`; the class itself stays internal. */
export class ColorValue implements ColorType {
  /** The channel values, in the order `getChannels` lists them */
  private v: Vec3

  constructor(
    /** The color's format (its space) */
    private f: ColorFormat,
    values: Vec3,
    private alpha: number,
  ) {
    this.v = values
  }

  private spec(channel: ColorChannel): ChannelSpec {
    const { ch, specs } = SPACES[this.f]
    const result = specs[channel === "alpha" ? 3 : ch.indexOf(channel)]
    if (!result) throw new Error("Unknown color channel: " + channel)
    return result
  }

  getFormat(): ColorFormat {
    return this.f
  }

  getChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return SPACES[this.f].ch
  }

  toFormat(format: ColorFormat): ColorType {
    if (format === this.f) return this
    if (!SPACES[format]) throw new Error(`Unsupported color conversion: ${this.f} -> ${format}`)
    return convert(this.f, this.v, this.alpha, format)
  }

  toString(format: ColorStringFormat = "css"): string {
    // An HSB color has no CSS of its own
    if (format === "css" && this.f === "hsba") return this.toFormat("hsla").toString("css")
    const own = SPACES[this.f].css(this.v, this.alpha, format)
    if (own != null) return own
    return this.toFormat(FORMAT_OF[format] ?? (format as ColorFormat)).toString(format)
  }

  toJSON(): Record<string, number> {
    const [a, b, c, alpha] = SPACES[this.f].json
    return { [a]: this.v[0], [b]: this.v[1], [c]: this.v[2], [alpha]: this.alpha }
  }

  toHexInt(): number {
    if (this.f !== "rgba") return this.toFormat("rgba").toHexInt()
    const [r, g, b] = this.v.map(Math.round)
    return (r << 16) | (g << 8) | b
  }

  clone(): ColorType {
    return new ColorValue(this.f, [...this.v], this.alpha)
  }

  getChannelValue(channel: ColorChannel): number {
    if (channel === "alpha") return this.alpha
    const index = SPACES[this.f].ch.indexOf(channel)
    if (index < 0) throw new Error("Unsupported color channel: " + channel)
    return this.v[index]
  }

  withChannelValue(channel: ColorChannel, value: number): ColorType {
    const { range, wrap } = this.spec(channel)
    let next = clampValue(value, range.minValue, range.maxValue)
    if (wrap) next = mod(next, range.maxValue)
    if (channel === "alpha") return new ColorValue(this.f, [...this.v], next)
    const v = [...this.v] as Vec3
    v[SPACES[this.f].ch.indexOf(channel)] = next
    return new ColorValue(this.f, v, this.alpha)
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    return { ...this.spec(channel).range }
  }

  formatChannelValue(channel: ColorChannel, locale: string): string {
    const { format, scale = 1 } = this.spec(channel)
    return getFormatter(locale, format).format(this.getChannelValue(channel) / scale)
  }

  getChannelValuePercent(channel: ColorChannel, valueToCheck?: number): number {
    const value = valueToCheck ?? this.getChannelValue(channel)
    const { minValue, maxValue } = this.getChannelRange(channel)
    return getValuePercent(value, minValue, maxValue)
  }

  getChannelPercentValue(channel: ColorChannel, percentToCheck: number): number {
    const { minValue, maxValue, step } = this.getChannelRange(channel)
    return snapValueToStep(getPercentValue(percentToCheck, minValue, maxValue, step), minValue, maxValue, step)
  }

  getColorAxes(xyChannels: Color2DAxes): ColorAxes {
    const { xChannel, yChannel } = xyChannels
    const channels = this.getChannels()
    const x = xChannel || channels.find((c) => c !== yChannel)!
    const y = yChannel || channels.find((c) => c !== x)!
    return { xChannel: x, yChannel: y, zChannel: channels.find((c) => c !== x && c !== y)! }
  }

  incrementChannel(channel: ColorChannel, stepSize: number): ColorType {
    const { minValue, maxValue, step } = this.getChannelRange(channel)
    const value = clampValue(this.getChannelValue(channel) + stepSize, minValue, maxValue)
    return this.withChannelValue(channel, snapValueToStep(value, minValue, maxValue, step))
  }

  decrementChannel(channel: ColorChannel, stepSize: number): ColorType {
    return this.incrementChannel(channel, -stepSize)
  }

  isEqual(color: ColorType): boolean {
    const a = this.toJSON()
    const b = color.toJSON()
    const keys = Object.keys(a)
    return (
      keys.length === Object.keys(b).length &&
      keys.every((key) => a[key] === b[key]) &&
      this.alpha === color.getChannelValue("alpha")
    )
  }
}

/**
 * The color in a space that has `channel`: the color itself when it does, otherwise the closest space,
 * like RGB for `red` or HSB for the `saturation` of an OKLCH color.
 */
export function getChannelColor(color: ColorType, channel: ColorChannel): ColorType {
  const format = color.getFormat()
  if (channel === "alpha" || color.getChannels().includes(channel)) return color
  switch (channel) {
    case "hue":
    case "saturation":
      return color.toFormat(format === "hsla" ? "hsla" : "hsba")
    case "lightness":
      return color.toFormat("hsla")
    case "brightness":
      return color.toFormat("hsba")
    case "a":
    case "b":
      return color.toFormat("oklab")
    case "chroma":
      return color.toFormat("oklch")
    default:
      return color.toFormat("rgba")
  }
}

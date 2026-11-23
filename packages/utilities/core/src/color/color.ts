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
const HUE = spec(0, 360, 1, 15, { style: "unit", unit: "degree", unitDisplay: "narrow", maximumFractionDigits: 2 })
const PERCENT = spec(0, 100, 1, 10, PERCENT_FORMAT, { scale: 100 })
const ALPHA = spec(0, 1, 0.01, 0.1, PERCENT_FORMAT)
const BYTE = spec(0, 255, 1, 17, { style: "decimal", maximumFractionDigits: 0 })
const OK_ALPHA = spec(0, 1, 0.01, 0.1, OK_FORMAT)
const OK_LIGHTNESS = spec(0, 1, 0.001, 0.05, OK_FORMAT)
const OK_AB = spec(-0.4, 0.4, 0.001, 0.02, OK_FORMAT)

const f2 = (v: number) => toFixedNumber(v, 2)
const f4 = (v: number) => toFixedNumber(v, 4)
const hex = (v: number) => Math.round(v).toString(16).padStart(2, "0")

/** `hsl(h, s%, l%)` and `hsb(h, s%, b%)`, with alpha for the `a` spelling and css */
const hueCss = (name: string) => (v: Vec3, alpha: number, format: ColorStringFormat) => {
  const body = `${f2(v[0])}, ${f2(v[1])}%, ${f2(v[2])}%`
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
      const body = [r, g, b].map(Math.round).join(", ")
      if (format === "rgb") return `rgb(${body})`
      if (format === "css" || format === "rgba") return `rgba(${body}, ${alpha})`
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

// Values are kept at full precision and read at 4 decimals, so conversions leave no float noise
const read = (n: number) => toFixedNumber(n, 4)

const formatters = new Map<string, Intl.NumberFormat>()
const getFormatter = (locale: string, options: Intl.NumberFormatOptions) => {
  const key = locale + JSON.stringify(options)
  let formatter = formatters.get(key)
  if (!formatter) formatters.set(key, (formatter = new Intl.NumberFormat(locale, options)))
  return formatter
}

function hueOf(r: number, g: number, b: number) {
  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)
  const chroma = max - min
  let hue = 0
  if (chroma !== 0) {
    hue = max === r ? (g - b) / chroma + (g < b ? 6 : 0) : max === g ? (b - r) / chroma + 2 : (r - g) / chroma + 4
  }
  return { hue: hue * 60, min, max, chroma }
}

const hueRgb = (channel: (n: number) => number, offsets: Vec3) => offsets.map((n) => channel(n)) as Vec3

const hslToRgb = ([h, s, l]: Vec3) => {
  const [S, L] = [s / 100, l / 100]
  const a = S * Math.min(L, 1 - L)
  return hueRgb((n, k = (n + h / 30) % 12) => L - a * Math.max(Math.min(k - 3, 9 - k, 1), -1), [0, 8, 4])
}

const hsbToRgb = ([h, s, b]: Vec3) => {
  const [S, B] = [s / 100, b / 100]
  return hueRgb((n, k = (n + h / 60) % 6) => B - S * B * Math.max(Math.min(k, 4 - k, 1), 0), [5, 3, 1])
}

const rgbToHsl = ([r, g, b]: Vec3): Vec3 => {
  const { hue, min, max, chroma } = hueOf(r, g, b)
  const l = (max + min) / 2
  return [hue, chroma === 0 ? 0 : (chroma / (l < 0.5 ? max + min : 2 - max - min)) * 100, l * 100]
}

const rgbToHsb = ([r, g, b]: Vec3): Vec3 => {
  const { hue, max, chroma } = hueOf(r, g, b)
  return [hue, max === 0 ? 0 : (chroma / max) * 100, max * 100]
}

const clip = (rgb: Vec3) => rgb.map(clamp01) as Vec3
const labToRgb = (lab: Vec3) => oklabToLinearRgb(lab).map(fromLinear) as Vec3
const rgbToLab = (rgb: Vec3) => linearRgbToOklab(rgb.map(toLinear) as Vec3)

const HUB: Record<ColorFormat, [to: (v: Vec3) => Vec3, from: (rgb: Vec3) => Vec3]> = {
  rgba: [(v) => v.map((c) => c / 255) as Vec3, (rgb) => clip(rgb).map((c) => c * 255) as Vec3],
  hsla: [hslToRgb, (rgb) => rgbToHsl(clip(rgb))],
  hsba: [hsbToRgb, (rgb) => rgbToHsb(clip(rgb))],
  oklab: [labToRgb, rgbToLab],
  oklch: [
    ([L, H, C]) => labToRgb(oklchToOklab([L, C, H])),
    (rgb) => {
      const [L, C, H] = oklabToOklch(rgbToLab(rgb))
      return [L, H, C]
    },
  ],
}

function hslHsb(v: Vec3, to: ColorFormat): Vec3 {
  const [h, s, x] = [v[0], v[1] / 100, v[2] / 100]
  if (to === "hsba") {
    const b = x + s * Math.min(x, 1 - x)
    return [h, b === 0 ? 0 : 2 * (1 - x / b) * 100, b * 100]
  }
  const l = x * (1 - s / 2)
  return [h, l === 0 || l === 1 ? 0 : ((x - l) / Math.min(l, 1 - l)) * 100, l * 100]
}

function convert(from: ColorFormat, v: Vec3, alpha: number, to: ColorFormat): ColorType {
  const values = from[0] === "h" && to[0] === "h" ? hslHsb(v, to) : HUB[to][1](HUB[from][0](v))
  return new ColorValue(to, values, alpha)
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
    const [x, y, z] = this.v.map(read)
    return { [a]: x, [b]: y, [c]: z, [alpha]: this.alpha }
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
    return read(this.v[index])
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

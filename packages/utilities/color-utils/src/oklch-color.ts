import { modeOklch, useMode as bootstrapMode, convertLchToLab } from "culori/fn"
import { Color } from "./color"
import type { ColorChannel, ColorChannelRange, ColorFormat, ColorStringFormat, ColorType } from "./types"
import { OklabColor } from "./oklab-color"
import { toFixedNumber } from "@zag-js/utils"

export const oklch = bootstrapMode(modeOklch)

export class OklchColor extends Color {
  constructor(
    private lightness: number,
    private chroma: number,
    private hue: number,
    private alpha: number,
  ) {
    super()
  }

  static parse(value: string): OklchColor | void {
    const parsed = oklch(value)
    if (!parsed) return
    const { l, c, h, alpha } = parsed
    return new OklchColor(toFixedNumber(l, 2), toFixedNumber(c, 2), toFixedNumber(h ?? 0, 2), alpha ?? 1)
  }

  toString(format: ColorStringFormat) {
    switch (format) {
      case "oklch":
      case "css":
        return `oklch(${this.lightness} ${this.chroma} ${this.hue}deg${this.alpha < 1 ? ` / ${this.alpha}` : ""})`
      default:
        return this.toOklab().toString(format)
    }
  }

  toFormat(format: ColorFormat): ColorType {
    switch (format) {
      case "oklch":
        return this
      case "oklab":
        return this.toOklab()
      case "rgba":
      case "hsla":
      case "hsba":
        return this.toOklab().toFormat(format)
      default:
        throw new Error("Unsupported color conversion: oklab -> " + format)
    }
  }

  /**
   * Converts a Oolab color to RGB.
   * Conversion adjusts for values that couldn't be displayed in RGB
   * @returns RGBColor
   */
  private toOklab(): OklabColor {
    const { l, a, b, alpha } = convertLchToLab({ l: this.lightness, c: this.chroma, h: this.hue, alpha: this.alpha })
    return new OklabColor(toFixedNumber(l, 2), toFixedNumber(a, 2), toFixedNumber(b, 2), alpha ?? 1)
  }

  clone(): OklchColor {
    return new OklchColor(this.lightness, this.chroma, this.hue, this.alpha)
  }

  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    switch (channel) {
      case "lightness":
      case "alpha":
        return { style: "percent" }
      case "hue":
        return { style: "unit", unit: "deg" }
      case "chroma":
        return { style: "decimal" }
      default:
        throw new Error("Unknown color channel: " + channel)
    }
  }

  formatChannelValue(channel: ColorChannel, locale: string) {
    let options = this.getChannelFormatOptions(channel)
    let value = this.getChannelValue(channel)
    return new Intl.NumberFormat(locale, options).format(value)
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "hue":
        return { minValue: 0, maxValue: 360, step: 0.1, pageSize: 1 }
      case "chroma":
        return { minValue: 0, maxValue: 0.5, step: 0.01, pageSize: 0.1 }
      case "lightness":
      case "alpha":
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 }
      default:
        throw new Error("Unknown color channel: " + channel)
    }
  }

  toJSON(): Record<"l" | "c" | "h" | "a", number> {
    return { l: this.lightness, c: this.chroma, h: this.hue, a: this.alpha }
  }

  getFormat(): ColorFormat {
    return "oklch"
  }

  private static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = ["hue", "chroma", "lightness"]

  getChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return OklchColor.colorChannels
  }
}

import { toFixedNumber, roundValue, clampValue } from "@zag-js/utils"
import { convertOklabToRgb, convertLabToLch } from "culori/fn"
import { Color, parseOkl } from "./color"
import { RGBColor } from "./rgb-color"
import type { ColorChannel, ColorChannelRange, ColorFormat, ColorStringFormat, ColorType } from "./types"
import { OklchColor } from "./oklch-color"

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
    const parsed = parseOkl(value, "oklab")

    if (!parsed) return
    const [l, a, b, alpha] = parsed
    const lValue = clampValue(l.type === "percentage" ? l.value * 0.01 : l.value, 0, 1)
    const aValue = clampValue(a.type === "percentage" ? a.value * 0.004 : a.value, -0.4, 0.4)
    const bValue = clampValue(b.type === "percentage" ? b.value * 0.004 : b.value, -0.4, 0.4)
    const alphaValue = alpha
      ? clampValue(alpha.type === "percentage" ? alpha.value * 0.01 : alpha.value, 0, 1)
      : undefined
    return new OklabColor(lValue, aValue, bValue, alphaValue ?? 1)
  }

  toString(format: ColorStringFormat): string {
    switch (format) {
      case "oklab":
      case "css":
        return `oklab(${this.lightness} ${this.a} ${this.b}${this.alpha < 1 ? ` / ${this.alpha}` : ""})`
      case "oklch":
        return this.toOklch().toString("oklch")
      default:
        return this.toRGB().toString(format)
    }
  }

  toFormat(format: ColorFormat): ColorType {
    switch (format) {
      case "oklab":
        return this
      case "oklch":
        return this.toOklch()
      case "rgba":
      case "hsla":
      case "hsba":
        return this.toRGB().toFormat(format)
      default:
        throw new Error("Unsupported color conversion: oklab -> " + format)
    }
  }

  /**
   * Converts a Oolab color to RGB.
   * Conversion adjusts for values that couldn't be displayed in RGB
   * @returns RGBColor
   */
  private toRGB(): RGBColor {
    const inRGb = convertOklabToRgb({ l: this.lightness, a: this.a, b: this.b, alpha: this.alpha })
    return new RGBColor(
      clampValue(roundValue(inRGb.r * 255, 0, 1), 0, 255),
      clampValue(roundValue(inRGb.g * 255, 0, 1), 0, 255),
      clampValue(roundValue(inRGb.b * 255, 0, 1), 0, 255),
      toFixedNumber(inRGb.alpha ?? 1, 2),
    )
  }

  private toOklch(): OklchColor {
    const { l, c, h, alpha } = convertLabToLch({ l: this.lightness, a: this.a, b: this.b, alpha: this.alpha })
    return new OklchColor(
      toFixedNumber(l, 2),
      clampValue(toFixedNumber(c, 2), 0, 0.5),
      toFixedNumber(h ?? 0, 2),
      alpha ?? 1,
    )
  }

  clone(): OklabColor {
    return new OklabColor(this.lightness, this.a, this.b, this.alpha)
  }

  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    switch (channel) {
      case "lightness":
      case "alpha":
        return { style: "percent" }
      case "a":
      case "b":
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
      case "a":
      case "b":
        return { minValue: -0.4, maxValue: 0.4, step: 0.01, pageSize: 0.1 }
      case "lightness":
      case "alpha":
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 }
      default:
        throw new Error("Unknown color channel: " + channel)
    }
  }

  toJSON(): Record<"l" | "a" | "b" | "alpha", number> {
    return { l: this.lightness, a: this.a, b: this.b, alpha: this.alpha }
  }

  getFormat(): ColorFormat {
    return "oklab"
  }

  private static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = ["lightness", "a", "b"]

  getChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return OklabColor.colorChannels
  }
}

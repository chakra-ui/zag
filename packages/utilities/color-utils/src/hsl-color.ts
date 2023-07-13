import { Color } from "./color"
import { HSBColor } from "./hsb-color"
import { RGBColor } from "./rgb-color"
import type { ColorChannel, ColorChannelRange, ColorFormat, ColorType } from "./types"
import { clampValue, mod, toFixedNumber } from "./utils"

export const HSL_REGEX =
  /hsl\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%)\)|hsla\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d(.\d+)?)\)/

export class HSLColor extends Color {
  constructor(
    private hue: number,
    private saturation: number,
    private lightness: number,
    private alpha: number,
  ) {
    super()
  }

  static parse(value: string): HSLColor | void {
    let m: RegExpMatchArray | null
    if ((m = value.match(HSL_REGEX))) {
      const [h, s, l, a] = (m[1] ?? m[2]).split(",").map((n) => Number(n.trim().replace("%", "")))
      return new HSLColor(mod(h, 360), clampValue(s, 0, 100), clampValue(l, 0, 100), clampValue(a ?? 1, 0, 1))
    }
  }

  toString(format: ColorFormat | "css") {
    switch (format) {
      case "hex":
        return this.toRGB().toString("hex")
      case "hexa":
        return this.toRGB().toString("hexa")
      case "hsl":
        return `hsl(${this.hue}, ${toFixedNumber(this.saturation, 2)}%, ${toFixedNumber(this.lightness, 2)}%)`
      case "css":
      case "hsla":
        return `hsla(${this.hue}, ${toFixedNumber(this.saturation, 2)}%, ${toFixedNumber(this.lightness, 2)}%, ${
          this.alpha
        })`
      default:
        return this.toFormat(format).toString(format)
    }
  }
  toFormat(format: ColorFormat): ColorType {
    switch (format) {
      case "hsl":
      case "hsla":
        return this
      case "hsb":
      case "hsba":
        return this.toHSB()
      case "rgb":
      case "rgba":
        return this.toRGB()
      default:
        throw new Error("Unsupported color conversion: hsl -> " + format)
    }
  }

  /**
   * Converts a HSL color to HSB.
   * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_HSV.
   * @returns An HSBColor object.
   */
  private toHSB(): ColorType {
    let saturation = this.saturation / 100
    let lightness = this.lightness / 100
    let brightness = lightness + saturation * Math.min(lightness, 1 - lightness)
    saturation = brightness === 0 ? 0 : 2 * (1 - lightness / brightness)
    return new HSBColor(
      toFixedNumber(this.hue, 2),
      toFixedNumber(saturation * 100, 2),
      toFixedNumber(brightness * 100, 2),
      this.alpha,
    )
  }

  /**
   * Converts a HSL color to RGB.
   * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative.
   * @returns An RGBColor object.
   */
  private toRGB(): ColorType {
    let hue = this.hue
    let saturation = this.saturation / 100
    let lightness = this.lightness / 100
    let a = saturation * Math.min(lightness, 1 - lightness)
    let fn = (n: number, k = (n + hue / 30) % 12) => lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return new RGBColor(Math.round(fn(0) * 255), Math.round(fn(8) * 255), Math.round(fn(4) * 255), this.alpha)
  }

  clone(): ColorType {
    return new HSLColor(this.hue, this.saturation, this.lightness, this.alpha)
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "hue":
        return { minValue: 0, maxValue: 360, step: 1, pageSize: 15 }
      case "saturation":
      case "lightness":
        return { minValue: 0, maxValue: 100, step: 1, pageSize: 10 }
      case "alpha":
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 }
      default:
        throw new Error("Unknown color channel: " + channel)
    }
  }

  getColorSpace(): ColorFormat {
    return "hsl"
  }

  private static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = ["hue", "saturation", "lightness"]

  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return HSLColor.colorChannels
  }
}

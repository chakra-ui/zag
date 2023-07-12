import { Color } from "./color"
import { HSLColor } from "./hsl-color"
import { RGBColor } from "./rgb-color"
import type { ColorChannel, ColorChannelRange, ColorFormat, ColorType } from "./types"
import { clampValue, mod, toFixedNumber } from "./utils"

const HSB_REGEX =
  /hsb\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%)\)|hsba\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d(.\d+)?)\)/

export class HSBColor extends Color {
  constructor(
    private hue: number,
    private saturation: number,
    private brightness: number,
    private alpha: number,
  ) {
    super()
  }

  static parse(value: string): HSBColor | void {
    let m: RegExpMatchArray | null
    if ((m = value.match(HSB_REGEX))) {
      const [h, s, b, a] = (m[1] ?? m[2]).split(",").map((n) => Number(n.trim().replace("%", "")))
      return new HSBColor(mod(h, 360), clampValue(s, 0, 100), clampValue(b, 0, 100), clampValue(a ?? 1, 0, 1))
    }
  }

  toString(format: ColorFormat | "css") {
    switch (format) {
      case "css":
        return this.toHSL().toString("css")
      case "hex":
        return this.toRGB().toString("hex")
      case "hexa":
        return this.toRGB().toString("hexa")
      case "hsb":
        return `hsb(${this.hue}, ${toFixedNumber(this.saturation, 2)}%, ${toFixedNumber(this.brightness, 2)}%)`
      case "hsba":
        return `hsba(${this.hue}, ${toFixedNumber(this.saturation, 2)}%, ${toFixedNumber(this.brightness, 2)}%, ${
          this.alpha
        })`
      default:
        return this.toFormat(format).toString(format)
    }
  }

  toFormat(format: ColorFormat): ColorType {
    switch (format) {
      case "hsb":
      case "hsba":
        return this
      case "hsl":
      case "hsla":
        return this.toHSL()
      case "rgb":
      case "rgba":
        return this.toRGB()
      default:
        throw new Error("Unsupported color conversion: hsb -> " + format)
    }
  }

  /**
   * Converts a HSB color to HSL.
   * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_HSL.
   * @returns An HSLColor object.
   */
  private toHSL(): ColorType {
    let saturation = this.saturation / 100
    let brightness = this.brightness / 100
    let lightness = brightness * (1 - saturation / 2)
    saturation = lightness === 0 || lightness === 1 ? 0 : (brightness - lightness) / Math.min(lightness, 1 - lightness)

    return new HSLColor(
      toFixedNumber(this.hue, 2),
      toFixedNumber(saturation * 100, 2),
      toFixedNumber(lightness * 100, 2),
      this.alpha,
    )
  }

  /**
   * Converts a HSV color value to RGB.
   * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB_alternative.
   * @returns An RGBColor object.
   */
  private toRGB(): ColorType {
    let hue = this.hue
    let saturation = this.saturation / 100
    let brightness = this.brightness / 100

    let fn = (n: number, k = (n + hue / 60) % 6) =>
      brightness - saturation * brightness * Math.max(Math.min(k, 4 - k, 1), 0)

    return new RGBColor(Math.round(fn(5) * 255), Math.round(fn(3) * 255), Math.round(fn(1) * 255), this.alpha)
  }

  clone(): ColorType {
    return new HSBColor(this.hue, this.saturation, this.brightness, this.alpha)
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "hue":
        return { minValue: 0, maxValue: 360, step: 1, pageSize: 15 }
      case "saturation":
      case "brightness":
        return { minValue: 0, maxValue: 100, step: 1, pageSize: 10 }
      case "alpha":
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 }
      default:
        throw new Error("Unknown color channel: " + channel)
    }
  }

  getColorSpace(): ColorFormat {
    return "hsb"
  }

  private static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = ["hue", "saturation", "brightness"]

  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return HSBColor.colorChannels
  }
}

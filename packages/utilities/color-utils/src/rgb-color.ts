import { clampValue, toFixedNumber } from "@zag-js/numeric-range"
import { Color } from "./color"
import { HSBColor } from "./hsb-color"
import { HSLColor } from "./hsl-color"
import type { ColorChannel, ColorChannelRange, ColorFormat, ColorStringFormat, ColorType } from "./types"

export class RGBColor extends Color {
  constructor(
    private red: number,
    private green: number,
    private blue: number,
    private alpha: number,
  ) {
    super()
  }

  static parse(value: string) {
    let colors: (number | undefined)[] = []

    // matching #rgb, #rgba, #rrggbb, #rrggbbaa
    if (/^#[\da-f]+$/i.test(value) && [4, 5, 7, 9].includes(value.length)) {
      const values = (value.length < 6 ? value.replace(/[^#]/gi, "$&$&") : value).slice(1).split("")
      while (values.length > 0) {
        colors.push(parseInt(values.splice(0, 2).join(""), 16))
      }
      colors[3] = colors[3] !== undefined ? colors[3] / 255 : undefined
    }

    // matching rgb(rrr, ggg, bbb), rgba(rrr, ggg, bbb, 0.a)
    const match = value.match(/^rgba?\((.*)\)$/)

    if (match?.[1]) {
      colors = match[1]
        .split(",")
        .map((value) => Number(value.trim()))
        .map((num, i) => clampValue(num, 0, i < 3 ? 255 : 1))
    }

    //@ts-expect-error
    return colors.length < 3 ? undefined : new RGBColor(colors[0], colors[1], colors[2], colors[3] ?? 1)
  }

  toString(format: ColorStringFormat) {
    switch (format) {
      case "hex":
        return (
          "#" +
          (
            this.red.toString(16).padStart(2, "0") +
            this.green.toString(16).padStart(2, "0") +
            this.blue.toString(16).padStart(2, "0")
          ).toUpperCase()
        )
      case "hexa":
        return (
          "#" +
          (
            this.red.toString(16).padStart(2, "0") +
            this.green.toString(16).padStart(2, "0") +
            this.blue.toString(16).padStart(2, "0") +
            Math.round(this.alpha * 255)
              .toString(16)
              .padStart(2, "0")
          ).toUpperCase()
        )
      case "rgb":
        return `rgb(${this.red}, ${this.green}, ${this.blue})`
      case "css":
      case "rgba":
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`
      case "hsl":
        return this.toHSL().toString("hsl")
      case "hsb":
        return this.toHSB().toString("hsb")
      default:
        return this.toFormat(format).toString(format)
    }
  }

  toFormat(format: ColorFormat): ColorType {
    switch (format) {
      case "rgba":
        return this
      case "hsba":
        return this.toHSB()
      case "hsla":
        return this.toHSL()
      default:
        throw new Error("Unsupported color conversion: rgb -> " + format)
    }
  }

  toHexInt(): number {
    return (this.red << 16) | (this.green << 8) | this.blue
  }

  /**
   * Converts an RGB color value to HSB.
   * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB.
   * @returns An HSBColor object.
   */
  private toHSB(): ColorType {
    const red = this.red / 255
    const green = this.green / 255
    const blue = this.blue / 255
    const min = Math.min(red, green, blue)
    const brightness = Math.max(red, green, blue)
    const chroma = brightness - min
    const saturation = brightness === 0 ? 0 : chroma / brightness
    let hue = 0 // achromatic

    if (chroma !== 0) {
      switch (brightness) {
        case red:
          hue = (green - blue) / chroma + (green < blue ? 6 : 0)
          break
        case green:
          hue = (blue - red) / chroma + 2
          break
        case blue:
          hue = (red - green) / chroma + 4
          break
      }

      hue /= 6
    }

    return new HSBColor(
      toFixedNumber(hue * 360, 2),
      toFixedNumber(saturation * 100, 2),
      toFixedNumber(brightness * 100, 2),
      toFixedNumber(this.alpha, 2),
    )
  }

  /**
   * Converts an RGB color value to HSL.
   * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB.
   * @returns An HSLColor object.
   */
  private toHSL(): ColorType {
    const red = this.red / 255
    const green = this.green / 255
    const blue = this.blue / 255
    const min = Math.min(red, green, blue)
    const max = Math.max(red, green, blue)
    const lightness = (max + min) / 2
    const chroma = max - min

    let hue = -1
    let saturation = -1

    if (chroma === 0) {
      hue = saturation = 0 // achromatic
    } else {
      saturation = chroma / (lightness < 0.5 ? max + min : 2 - max - min)

      switch (max) {
        case red:
          hue = (green - blue) / chroma + (green < blue ? 6 : 0)
          break
        case green:
          hue = (blue - red) / chroma + 2
          break
        case blue:
          hue = (red - green) / chroma + 4
          break
      }

      hue /= 6
    }

    return new HSLColor(
      toFixedNumber(hue * 360, 2),
      toFixedNumber(saturation * 100, 2),
      toFixedNumber(lightness * 100, 2),
      toFixedNumber(this.alpha, 2),
    )
  }

  clone(): ColorType {
    return new RGBColor(this.red, this.green, this.blue, this.alpha)
  }

  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    switch (channel) {
      case "red":
      case "green":
      case "blue":
        return { style: "decimal" }
      case "alpha":
        return { style: "percent" }
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
      case "red":
      case "green":
      case "blue":
        return { minValue: 0x0, maxValue: 0xff, step: 0x1, pageSize: 0x11 }
      case "alpha":
        return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 }
      default:
        throw new Error("Unknown color channel: " + channel)
    }
  }

  toJSON(): Record<"r" | "g" | "b" | "a", number> {
    return { r: this.red, g: this.green, b: this.blue, a: this.alpha }
  }

  getFormat(): ColorFormat {
    return "rgba"
  }

  private static colorChannels: [ColorChannel, ColorChannel, ColorChannel] = ["red", "green", "blue"]

  getChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return RGBColor.colorChannels
  }
}

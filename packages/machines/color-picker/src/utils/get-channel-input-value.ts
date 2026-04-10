import { parseColor, type Color, type ColorChannelRange } from "@zag-js/color-utils"
import type { ExtendedColorChannel } from "../color-picker.types"

export function getChannelValue(color: Color, channel: ExtendedColorChannel | null | undefined): string {
  if (channel == null) return ""

  if (channel === "hex") {
    return color.toString("hex")
  }

  if (channel === "css") {
    return color.toString("css")
  }

  if (channel in color) {
    return roundedValue(color, channel)
  }

  const fmt = color.getFormat()
  const isHSL = fmt === "hsla"

  switch (channel) {
    case "hue":
      if (fmt === "oklch") {
        return roundedValue(color.toFormat("oklch"), "hue")
      }
      return isHSL ? roundedValue(color.toFormat("hsla"), "hue") : roundedValue(color.toFormat("hsba"), "hue")

    case "saturation":
      return isHSL
        ? roundedValue(color.toFormat("hsla"), "saturation")
        : roundedValue(color.toFormat("hsba"), "saturation")

    case "lightness":
      if (fmt === "oklab" || fmt === "oklch") {
        return roundedValue(color, "lightness")
      }
      return roundedValue(color.toFormat("hsla"), "lightness")

    case "brightness":
      return roundedValue(color.toFormat("hsba"), "brightness")

    case "a":
    case "b":
      return roundedValue(color.toFormat("oklab"), channel)

    case "chroma":
      return roundedValue(color.toFormat("oklch"), channel)

    case "red":
    case "green":
    case "blue":
      return roundedValue(color.toFormat("rgba"), channel)

    default:
      return roundedValue(color, channel)
  }
}

/** Round a channel value based on its step precision. */
function roundedValue(color: Color, channel: string): string {
  const value = color.getChannelValue(channel as any)
  const { step } = color.getChannelRange(channel as any)
  if (step >= 1) return Math.round(value).toString()
  const decimals = Math.min(4, Math.max(0, Math.ceil(-Math.log10(step))))
  return parseFloat(value.toFixed(decimals)).toString()
}

export function getChannelRange(color: Color, channel: ExtendedColorChannel): ColorChannelRange | undefined {
  switch (channel) {
    case "hex":
      const minColor = parseColor("#000000")
      const maxColor = parseColor("#FFFFFF")
      return {
        minValue: minColor.toHexInt(),
        maxValue: maxColor.toHexInt(),
        pageSize: 10,
        step: 1,
      }

    case "css":
      return undefined

    case "hue":
      if (color.getFormat() === "oklch") {
        return color.toFormat("oklch").getChannelRange("hue")
      }
      return color.toFormat("hsla").getChannelRange(channel)

    case "saturation":
    case "lightness":
      if (color.getFormat() === "oklab" || color.getFormat() === "oklch") {
        return color.getChannelRange(channel)
      }
      return color.toFormat("hsla").getChannelRange(channel)

    case "brightness":
      return color.toFormat("hsba").getChannelRange(channel)

    case "a":
    case "b":
      return color.toFormat("oklab").getChannelRange(channel)

    case "chroma":
      return color.toFormat("oklch").getChannelRange(channel)

    case "red":
    case "green":
    case "blue":
      return color.toFormat("rgba").getChannelRange(channel)

    default:
      return color.getChannelRange(channel)
  }
}

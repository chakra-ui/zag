import type { Color } from "@zag-js/color-utils"
import type { ExtendedColorChannel } from "../color-picker.types"

export function getChannelInputValue(color: Color, channel: ExtendedColorChannel | null | undefined) {
  if (channel == null) return

  switch (channel) {
    case "hex":
      return color.toString("hex")
    case "css":
      return color.toString("css")
    case "hue":
    case "saturation":
    case "lightness":
      return color.toFormat("hsl").getChannelValue("lightness").toString()
    case "brightness":
      return color.toFormat("hsb").getChannelValue("brightness").toString()
    case "red":
    case "green":
    case "blue":
      return color.toFormat("rgb").getChannelValue(channel).toString()
    default:
      return color.getChannelValue(channel).toString()
  }
}

export function getChannelInputRange(color: Color, channel: ExtendedColorChannel) {
  switch (channel) {
    case "hex":
    case "css":
      return undefined
    case "hue":
    case "saturation":
    case "lightness":
      return color.toFormat("hsl").getChannelRange(channel)
    case "brightness":
      return color.toFormat("hsb").getChannelRange(channel)
    case "red":
    case "green":
    case "blue":
      return color.toFormat("rgb").getChannelRange(channel)
    default:
      return color.getChannelRange(channel)
  }
}

import { parseColor, type Color, type ColorChannel } from "@zag-js/color-utils"

export function getChannelDisplayColor(color: Color, channel: ColorChannel) {
  switch (channel) {
    case "hue":
      if (color.getFormat() === "oklch") return color
      return parseColor(`hsl(${color.getChannelValue("hue")}, 100%, 50%)`)
    case "lightness":
    case "brightness":
    case "saturation":
    case "red":
    case "green":
    case "blue":
      return color.withChannelValue("alpha", 1)
    case "alpha":
    case "a":
    case "b":
    case "chroma":
      return color
    default:
      throw new Error("Unknown color channel: " + channel)
  }
}

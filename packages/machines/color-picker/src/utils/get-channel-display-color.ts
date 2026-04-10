import { parseColor, type Color, type ColorChannel } from "@zag-js/color-utils"

export function getChannelDisplayColor(color: Color, channel: ColorChannel) {
  const fmt = color.getFormat()

  switch (channel) {
    case "hue":
      if (fmt === "oklch") {
        return color.withChannelValue("alpha", 1)
      }
      return parseColor(`hsl(${color.getChannelValue("hue")}, 100%, 50%)`)
    case "lightness":
    case "chroma":
    case "a":
    case "b":
    case "brightness":
    case "saturation":
    case "red":
    case "green":
    case "blue":
      return color.withChannelValue("alpha", 1)
    case "alpha": {
      return color
    }
    default:
      throw new Error("Unknown color channel: " + channel)
  }
}

import { Color } from "@zag-js/color-utils"
import { ExtendedColorChannel } from "../color-picker.types"

export function getChannelInputValue(color: Color, channel: ExtendedColorChannel) {
  switch (channel) {
    case "hex":
      return color.toString("hex")
    case "css":
      return color.toString("css")
    default:
      return color.getChannelValue(channel).toString()
  }
}

export function getChannelInputRange(color: Color, channel: ExtendedColorChannel) {
  switch (channel) {
    case "hex":
    case "css":
      return undefined
    default:
      return color.getChannelRange(channel)
  }
}

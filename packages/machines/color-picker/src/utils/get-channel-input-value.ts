import type { Color } from "@zag-js/color-utils"
import type { ExtendedColorChannel } from "../color-picker.types"

export function getChannelInputValue(color: Color, channel: ExtendedColorChannel | null | undefined) {
  if (channel == null) return

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

import { getChannelColor, type Color, type ColorChannel, type ColorChannelRange } from "@zag-js/utils/color"
import type { ExtendedColorChannel } from "../color-picker.types"

/** The text a channel input shows, rounded to the channel's step */
export function getChannelValue(color: Color, channel: ExtendedColorChannel | null | undefined): string {
  if (channel == null) return ""
  if (channel === "hex" || channel === "css") return color.toString(channel)
  const owner = getChannelColor(color, channel)
  const value = owner.getChannelValue(channel)
  const { step } = owner.getChannelRange(channel)
  if (step >= 1) return Math.round(value).toString()
  const decimals = Math.min(4, Math.max(0, Math.ceil(-Math.log10(step))))
  return parseFloat(value.toFixed(decimals)).toString()
}

// #000000 to #FFFFFF as integers
const HEX_RANGE: ColorChannelRange = { minValue: 0, maxValue: 0xffffff, pageSize: 10, step: 1 }

export function getChannelRange(color: Color, channel: ExtendedColorChannel): ColorChannelRange | undefined {
  if (channel === "hex") return HEX_RANGE
  if (channel === "css") return undefined
  return getChannelColor(color, channel as ColorChannel).getChannelRange(channel)
}

import type { ExtendedColorChannel } from "../color-picker.types"

const channelLabels: Record<ExtendedColorChannel, string> = {
  hue: "Hue",
  saturation: "Saturation",
  brightness: "Brightness",
  lightness: "Lightness",
  red: "Red",
  green: "Green",
  blue: "Blue",
  a: "A",
  b: "B",
  chroma: "Chroma",
  alpha: "Alpha",
  hex: "Hex",
  css: "CSS color",
}

export function getChannelLabel(channel: ExtendedColorChannel) {
  return channelLabels[channel]
}

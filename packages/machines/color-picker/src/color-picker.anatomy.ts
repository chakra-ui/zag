import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("color-picker", [
  "area",
  "areaThumb",
  "areaGradient",
  "channelSliderTrack",
  "channelSliderTrackBackground",
  "channelSliderThumb",
  "channelInput",
  "swatch",
  "swatchBackground",
  "content",
  "label",
  "eyeDropperTrigger",
])

export const parts = anatomy.build()

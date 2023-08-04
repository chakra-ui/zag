import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("color-picker", [
  "area",
  "areaThumb",
  "areaGradient",
  "channelSliderTrack",
  "channelSliderTrackBg",
  "channelSliderThumb",
  "channelInput",
  "swatch",
  "swatchBg",
  "content",
  "label",
  "hiddenInput",
  "eyeDropTrigger",
])

export const parts = anatomy.build()

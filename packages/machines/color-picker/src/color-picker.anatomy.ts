import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("color-picker", [
  "root",
  "label",
  "control",
  "trigger",
  "positioner",
  "content",
  "area",
  "areaThumb",
  "areaBackground",
  "channelSlider",
  "channelSliderTrack",
  "channelSliderThumb",
  "channelInput",
  "transparencyGrid",
  "swatchGroup",
  "swatchTrigger",
  "swatchIndicator",
  "swatch",
  "eyeDropperTrigger",
  "formatTrigger",
  "formatSelect",
])

export const parts = anatomy.build()

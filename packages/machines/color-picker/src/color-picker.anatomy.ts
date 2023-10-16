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
  "swatch",
  "eyeDropperTrigger",
])

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("color-picker", [
  "area",
  "areaThumb",
  "areaGradient",
  "sliderTrack",
  "sliderTrackBg",
  "sliderThumb",
  "input",
  "swatchBg",
  "swatch",
  "content",
  "label",
  "eyeDropTrigger",
])

export const parts = anatomy.build()

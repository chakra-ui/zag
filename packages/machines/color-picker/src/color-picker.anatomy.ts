import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("color-picker", [
  "area",
  "areaThumb",
  "areaGradient",
  "sliderTrack",
  "sliderTrackBg",
  "sliderThumb",
  "input",
  "preview",
  "label",
  "eyeDropTrigger",
])

export const parts = anatomy.build()

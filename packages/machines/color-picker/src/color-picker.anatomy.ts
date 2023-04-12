import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("color-picker", [
  "area",
  "areaThumb",
  "sliderTrack",
  "sliderThumb",
  "input",
  "preview",
  "label",
  "eyeDropTrigger",
])

export const parts = anatomy.build()

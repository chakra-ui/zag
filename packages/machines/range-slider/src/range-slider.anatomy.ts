import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("rangeSlider").parts(
  "root",
  "label",
  "output",
  "track",
  "thumb",
  "input",
  "range",
  "control",
  "markerGroup",
  "marker",
)
export const parts = anatomy.build()

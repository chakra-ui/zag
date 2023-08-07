import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("range-slider").parts(
  "root",
  "label",
  "thumb",
  "output",
  "track",
  "range",
  "control",
  "markerGroup",
  "marker",
)
export const parts = anatomy.build()

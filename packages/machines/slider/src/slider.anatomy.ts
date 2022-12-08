import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("slider").parts(
  "root",
  "label",
  "thumb",
  "hiddenInput",
  "output",
  "track",
  "range",
  "control",
  "markerGroup",
  "marker",
)
export const parts = anatomy.build()

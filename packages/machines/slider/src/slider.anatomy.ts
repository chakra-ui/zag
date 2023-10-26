import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("slider").parts(
  "root",
  "label",
  "thumb",
  "valueText",
  "track",
  "range",
  "control",
  "markerGroup",
  "marker",
)

export const parts = anatomy.build()

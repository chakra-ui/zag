import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("angle-slider").parts(
  "root",
  "label",
  "thumb",
  "valueText",
  "control",
  "track",
  "markerGroup",
  "marker",
)

export const parts = anatomy.build()

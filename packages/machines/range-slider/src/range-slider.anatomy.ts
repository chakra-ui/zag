import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("rangeSlider").parts(
  "root",
  "label",
  "output",
  "track",
  "thumb",
  "input", // TODO rename to hiddenInput
  "range",
  "control",
  "markerGroup",
  "marker",
)
export const parts = anatomy.build()

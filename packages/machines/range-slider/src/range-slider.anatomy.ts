import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("rangeSlider").parts(
  "root",
  "label",
  "control",
  "track",
  "range",
  "thumb",
  "output",
)

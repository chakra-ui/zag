import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("date-input").parts(
  "root",
  "label",
  "control",
  "segmentGroup",
  "segment",
  "hiddenInput",
)

export const parts = anatomy.build()

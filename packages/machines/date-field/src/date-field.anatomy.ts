import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("date-field").parts(
  "root",
  "label",
  "control",
  "segmentGroup",
  "segment",
  "hiddenInput",
)

export const parts = anatomy.build()

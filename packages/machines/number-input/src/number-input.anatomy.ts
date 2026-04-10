import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("numberInput").parts(
  "root",
  "label",
  "input",
  "control",
  "valueText",
  "incrementTrigger",
  "decrementTrigger",
  "scrubber",
  "scrubberCursor",
)

export const parts = anatomy.build()

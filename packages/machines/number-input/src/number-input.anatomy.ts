import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("numberInput").parts(
  "root",
  "label",
  "input",
  "control",
  "incrementTrigger",
  "decrementTrigger",
  "scrubber",
)
export const parts = anatomy.build()

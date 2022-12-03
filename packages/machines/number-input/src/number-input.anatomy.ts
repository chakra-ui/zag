import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("numberInput").parts(
  "root",
  "input",
  "label",
  "incrementButton",
  "decrementButton",
  "scrubber",
)

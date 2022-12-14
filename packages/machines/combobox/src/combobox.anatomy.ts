import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("combobox").parts(
  "root",
  "label",
  "input",
  "positioner",
  "control",
  "toggleButton",
  "content",
  "clearButton",
  "option",
  "optionGroup",
)
export const parts = anatomy.build()

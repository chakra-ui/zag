import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("select").parts(
  "label",
  "positioner",
  "trigger",
  "option",
  "optionGroup",
  "optionGroupLabel",
  "hiddenSelect",
  "content",
)
export const parts = anatomy.build()

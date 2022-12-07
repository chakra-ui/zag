import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("select").parts(
  "label",
  "positioner",
  "trigger",
  "option",
  "optionGroup",
  "optionGroupLabel",
  "select",
  "menu",
)
export const parts = anatomy.build()

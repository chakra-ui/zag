import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("select").parts(
  "label",
  "positioner",
  "trigger",
  "option",
  "optionGroup",
  "optionGroupLabel",
  "select", // TODO rename to hiddenSelect
  "menu", // TOD rename to content
)
export const parts = anatomy.build()

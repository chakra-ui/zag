import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("autocomplete").parts(
  "root",
  "label",
  "control",
  "input",
  "trigger",
  "clearTrigger",
  "positioner",
  "content",
  "list",
  "empty",
  "item",
  "itemText",
  "itemGroup",
  "itemGroupLabel",
  "separator",
)

export const parts = anatomy.build()

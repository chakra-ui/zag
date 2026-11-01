import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("listbox").parts(
  "empty",
  "label",
  "input",
  "item",
  "itemText",
  "itemIndicator",
  "itemGroup",
  "itemGroupLabel",
  "content",
  "list",
  "root",
  "valueText",
)
export const parts = anatomy.build()

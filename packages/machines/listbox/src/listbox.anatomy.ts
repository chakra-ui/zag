import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("listbox").parts(
  "label",
  "item",
  "itemText",
  "itemIndicator",
  "itemGroup",
  "itemGroupLabel",
  "content",
  "root",
  "valueText",
)
export const parts = anatomy.build()

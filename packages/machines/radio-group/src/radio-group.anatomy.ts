import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("radio-group").parts(
  "root",
  "label",
  "item",
  "itemLabel",
  "itemControl",
  "indicator",
)
export const parts = anatomy.build()

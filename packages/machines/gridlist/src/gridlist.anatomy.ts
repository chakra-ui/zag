import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("gridlist").parts(
  "root",
  "label",
  "content",
  "itemGroup",
  "itemGroupLabel",
  "item",
  "cell",
  "itemText",
  "itemIndicator",
  "itemCheckbox",
  "empty",
)

export const parts = anatomy.build()

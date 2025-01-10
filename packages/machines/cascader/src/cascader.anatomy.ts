import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("cascader").parts(
  "root",
  "label",
  "control",
  "trigger",
  "clearTrigger",
  "positioner",
  "content",
  "list",
  "indicator",
  "item",
  "itemText",
)

export const parts = anatomy.build()

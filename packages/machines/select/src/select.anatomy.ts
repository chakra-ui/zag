import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("select").parts(
  "label",
  "positioner",
  "trigger",
  "clearTrigger",
  "item",
  "itemText",
  "itemIndicator",
  "itemGroup",
  "itemGroupLabel",
  "content",
  "root",
  "control",
)
export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("select").parts(
  "label",
  "positioner",
  "trigger",
  "indicator",
  "clearTrigger",
  "item",
  "itemText",
  "itemIndicator",
  "itemGroup",
  "itemGroupLabel",
  "list",
  "content",
  "root",
  "control",
  "valueText",
)
export const parts = anatomy.build()

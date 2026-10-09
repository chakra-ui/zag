import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("menu").parts(
  "arrow",
  "arrowTip",
  "content",
  "contextTrigger",
  "indicator",
  "input",
  "item",
  "itemGroup",
  "itemGroupLabel",
  "itemIndicator",
  "itemText",
  "list",
  "positioner",
  "separator",
  "trigger",
  "triggerItem",
)
export const parts = anatomy.build()

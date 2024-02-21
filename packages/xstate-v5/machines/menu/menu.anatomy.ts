import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("menu").parts(
  "contextTrigger",
  "trigger",
  "triggerItem",
  "indicator",
  "positioner",
  "arrow",
  "arrowTip",
  "content",
  "separator",
  "item",
  "optionItem",
  "optionItemIndicator",
  "optionItemText",
  "itemGroupLabel",
  "itemGroup",
)
export const parts = anatomy.build()

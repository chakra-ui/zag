import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("menu").parts(
  "contextTrigger",
  "trigger",
  "triggerItem",
  "positioner",
  "arrow",
  "arrowTip",
  "content",
  "separator",
  "item",
  "optionItem",
  "itemGroupLabel",
  "itemGroup",
)
export const parts = anatomy.build()

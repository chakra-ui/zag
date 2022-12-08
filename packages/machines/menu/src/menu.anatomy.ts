import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("menu").parts(
  "trigger",
  "triggerItem",
  "positioner",
  "arrow",
  "arrowTip",
  "content",
  "separator",
  "item",
  "optionItem",
  "groupLabel",
  "group",
)
export const parts = anatomy.build()

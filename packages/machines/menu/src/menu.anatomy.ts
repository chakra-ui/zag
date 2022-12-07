import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("menu").parts(
  "trigger",
  "triggerItem",
  "positioner",
  "arrow",
  "arrowInner",
  "content",
  "separator",
  "item",
  "optionItem",
  "label",
  "group",
)
export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("menu").parts(
  "trigger",
  "triggerItem",
  "positioner",
  "arrow",
  "arrowInner", // TODO rename to InnerArrow
  "content",
  "separator",
  "item",
  "optionItem",
  "label", // TODO rename to groupLabel
  "group",
)
export const parts = anatomy.build()

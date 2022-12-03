import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("menu").parts(
  "trigger",
  "positioner",
  "content",
  "item",
  "optionItem",
  "contextTrigger",
  "separator",
)

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("steps").parts(
  "root",
  "list",
  "item",
  "trigger",
  "indicator",
  "separator",
  "content",
  "nextTrigger",
  "prevTrigger",
  "progress",
)

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("timer").parts(
  "root",
  "item",
  "itemValue",
  "itemLabel",
  "actionTrigger",
  "separator",
)

export const parts = anatomy.build()

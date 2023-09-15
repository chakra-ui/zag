import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tagsInput").parts(
  "root",
  "label",
  "control",
  "input",
  "clearTrigger",
  "item",
  "itemInput",
  "itemText",
  "itemDeleteTrigger",
)

export const parts = anatomy.build()

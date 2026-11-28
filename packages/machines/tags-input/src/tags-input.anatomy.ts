import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tagsInput").parts(
  "root",
  "label",
  "control",
  "input",
  "clearTrigger",
  "item",
  "itemPreview",
  "itemInput",
  "itemText",
  "itemRemoveTrigger",
)

export const parts = anatomy.build()

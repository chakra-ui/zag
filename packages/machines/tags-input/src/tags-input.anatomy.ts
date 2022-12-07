import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tagsInput").parts(
  "root",
  "label",
  "control",
  "input",
  "hiddenInput",
  "clearButton", // TODO rename clearTrigger
  "tag",
  "tagInput",
  "deleteButton", // TODO rename tagDeleteTrigger
)
export const parts = anatomy.build()

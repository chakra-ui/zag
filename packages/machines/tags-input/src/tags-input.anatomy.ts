import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tagsInput").parts(
  "root",
  "label",
  "control",
  "input",
  "hiddenInput",
  "tag",
  "tagInput",
  "deleteButton",
  "clearButton",
)
export const parts = anatomy.build()

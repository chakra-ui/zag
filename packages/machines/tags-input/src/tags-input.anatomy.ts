import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tagsInput").parts(
  "root",
  "label",
  "control",
  "tag",
  "input",
  "hiddenInput",
  "clearButton",
  "tagInput",
  "tagDeleteButton",
)

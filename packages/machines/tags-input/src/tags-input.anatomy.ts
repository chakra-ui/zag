import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tagsInput").parts(
  "root",
  "label",
  "control",
  "input",
  "clearTrigger",
  "hiddenInput",
  "tag",
  "tagInput",
  "tagDeleteTrigger",
)

export const parts = anatomy.build()

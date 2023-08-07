import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tagsInput").parts(
  "root",
  "label",
  "control",
  "input",
  "clearTrigger",
  "tag",
  "tagInput",
  "tagDeleteTrigger",
)

export const parts = anatomy.build()

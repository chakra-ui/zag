import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tagsInput").parts(
  "root",
  "label",
  "control",
  "input",
  "hiddenInput",
  "tag",
  "tagInput",
  "deleteButton", // TODO rename to tagDeleteTrigger
  "clearButton", // TDOD rename to clearTrigger
)
export const parts = anatomy.build()

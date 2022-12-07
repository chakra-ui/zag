import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tabs").parts(
  "root",
  "triggerGroup", // TODO rename to tablist
  "trigger", // TODO rename to trigger
  "contentGroup",
  "content",
  "deleteButton", // TODO remove
  "indicator",
)
export const parts = anatomy.build()

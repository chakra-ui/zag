import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tabs").parts(
  "root",
  "triggerGroup",
  "trigger",
  "contentGroup",
  "content",
  "deleteButton",
  "indicator",
)
export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("bottom-sheet").parts(
  "content",
  "title",
  "trigger",
  "backdrop",
  "grabber",
  "grabberIndicator",
  "closeTrigger",
)

export const parts = anatomy.build()

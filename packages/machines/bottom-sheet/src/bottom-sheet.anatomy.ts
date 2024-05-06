import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("bottom-sheet").parts(
  "content",
  "trigger",
  "overlay",
  "backdrop",
  "header",
  "grabber",
  "grabberIndicator",
  "closeTrigger",
)

export const parts = anatomy.build()

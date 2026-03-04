import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("drawer").parts(
  "positioner",
  "content",
  "title",
  "trigger",
  "backdrop",
  "grabber",
  "grabberIndicator",
  "closeTrigger",
)

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("drawer").parts(
  "positioner",
  "content",
  "title",
  "description",
  "trigger",
  "backdrop",
  "grabber",
  "grabberIndicator",
  "closeTrigger",
  "swipeArea",
)

export const parts = anatomy.build()

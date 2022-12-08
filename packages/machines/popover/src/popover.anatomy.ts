import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("popover").parts(
  "arrow",
  "arrowTip",
  "anchor",
  "trigger",
  "positioner",
  "content",
  "title",
  "description",
  "closeTrigger",
)
export const parts = anatomy.build()

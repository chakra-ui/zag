import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("popover").parts(
  "arrow",
  "arrowTip",
  "anchor",
  "trigger",
  "indicator",
  "positioner",
  "content",
  "viewport",
  "title",
  "description",
  "closeTrigger",
)

export const parts = anatomy.build()

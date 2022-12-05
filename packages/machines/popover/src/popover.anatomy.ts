import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("popover").parts(
  "arrow",
  "arrowInner",
  "anchor",
  "trigger",
  "positioner",
  "content",
  "title",
  "description",
  "closeButton",
)
export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("popover").parts(
  "arrow",
  "arrowInner", // TODO innerArrow
  "anchor",
  "trigger",
  "positioner",
  "content",
  "title",
  "description",
  "closeButton", // close trigger
)
export const parts = anatomy.build()

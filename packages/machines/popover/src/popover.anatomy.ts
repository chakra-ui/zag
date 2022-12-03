import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("popover").parts(
  "trigger",
  "positioner",
  "content",
  "title",
  "description",
  "closeButton",
  "arrow",
  "anchor",
)

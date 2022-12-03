import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("dialog").parts(
  "trigger",
  "backdrop",
  "underlay",
  "content",
  "title",
  "description",
  "closeButton",
)

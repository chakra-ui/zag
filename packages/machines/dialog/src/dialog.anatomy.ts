import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("dialog").parts(
  "trigger",
  "backdrop",
  "container",
  "content",
  "title",
  "description",
  "closeButton",
)
export const parts = anatomy.build()

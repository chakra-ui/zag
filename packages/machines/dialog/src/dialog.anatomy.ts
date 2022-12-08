import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("dialog").parts(
  "trigger",
  "backdrop",
  "container",
  "content",
  "title",
  "description",
  "closeTrigger",
)
export const parts = anatomy.build()

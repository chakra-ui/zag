import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("dialog").parts(
  "trigger",
  "backdrop",
  "underlay", // TODO rename in PR
  "content",
  "title",
  "description",
  "closeButton", // close trigger
)
export const parts = anatomy.build()

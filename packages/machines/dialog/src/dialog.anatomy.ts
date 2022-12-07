import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("dialog").parts(
  "trigger",
  "backdrop",
  "underlay", // TODO rename in PR
  "content",
  "title",
  "description",
  "closeButton", // TODO rename to closeTrigger
)
export const parts = anatomy.build()

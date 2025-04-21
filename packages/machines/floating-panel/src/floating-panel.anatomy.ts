import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("floating-panel").parts(
  "trigger",
  "positioner",
  "content",
  "header",
  "body",
  "title",
  "resizeTrigger",
  "dragTrigger",
  "stageTrigger",
  "closeTrigger",
  "control",
)

export const parts = anatomy.build()

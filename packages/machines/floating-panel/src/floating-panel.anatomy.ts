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
  "minimizeTrigger",
  "maximizeTrigger",
  "closeTrigger",
  "restoreTrigger",
  "dock",
)

export const parts = anatomy.build()

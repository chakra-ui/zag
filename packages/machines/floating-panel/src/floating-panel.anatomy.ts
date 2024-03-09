import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("floating-panel").parts(
  "trigger",
  "positioner",
  "content",
  "header",
  "resizeTrigger",
  "dragTrigger",
  "minimizeTrigger",
  "maximizeTrigger",
  "closeTrigger",
  "dock",
)

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tour").parts(
  "content",
  "overlay",
  "nextTrigger",
  "prevTrigger",
  "closeTrigger",
  "progressText",
  "title",
  "description",
  "positioner",
  "arrow",
  "arrowTip",
  "stroke",
)

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tour").parts(
  "content",
  "nextTrigger",
  "prevTrigger",
  "closeTrigger",
  "skipTrigger",
  "progressText",
  "title",
  "description",
  "positioner",
  "arrow",
  "arrowTip",
  "overlay",
  "spotlight",
)

export const parts = anatomy.build()

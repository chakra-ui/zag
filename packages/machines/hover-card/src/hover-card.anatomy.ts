import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("hoverCard").parts(
  "arrow",
  "arrowTip",
  "trigger",
  "positioner",
  "viewport",
  "content",
)
export const parts = anatomy.build()

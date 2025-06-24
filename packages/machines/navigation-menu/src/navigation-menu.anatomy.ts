import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("navigation-menu").parts(
  "root",
  "viewportPositioner",
  "viewport",
  "trigger",
  "content",
  "list",
  "item",
  "link",
  "indicator",
  "indicatorTrack",
  "arrow",
)

export const parts = anatomy.build()

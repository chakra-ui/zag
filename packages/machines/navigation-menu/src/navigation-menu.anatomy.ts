import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("navigation-menu").parts(
  "root",
  "viewport",
  "trigger",
  "content",
  "list",
  "item",
  "link",
  "indicator",
)

export const parts = anatomy.build()

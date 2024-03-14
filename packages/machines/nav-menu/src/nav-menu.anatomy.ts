import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("nav-menu").parts(
  "list",
  "item",
  "trigger",
  "indicator",
  "linkContentGroup",
  "link",
)

export const parts = anatomy.build()

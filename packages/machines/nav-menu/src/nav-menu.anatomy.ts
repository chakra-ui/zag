import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("nav-menu").parts(
  "root",
  "list",
  "item",
  "trigger",
  "indicator",
  "linkContentGroup",
  "link",
)

export const parts = anatomy.build()

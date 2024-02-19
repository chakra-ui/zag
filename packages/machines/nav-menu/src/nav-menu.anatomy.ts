import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("nav-menu").parts(
  "root",
  "trigger",
  "positioner",
  "content",
  "separator",
  "menu-item",
)

export const parts = anatomy.build()

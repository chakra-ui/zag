import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("wheel-picker").parts(
  "root",
  "label",
  "control",
  "itemGroup",
  "item",
  "highlight",
  "highlightItemGroup",
  "highlightItem",
)

export const parts = anatomy.build()

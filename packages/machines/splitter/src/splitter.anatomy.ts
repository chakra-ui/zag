import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("splitter").parts(
  "root",
  "secondaryPane",
  "primaryPane",
  "toggleButton",
  "label",
  "splitter",
)
export const parts = anatomy.build()

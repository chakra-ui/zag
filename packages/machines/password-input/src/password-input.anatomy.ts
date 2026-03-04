import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("password-input").parts(
  "root",
  "input",
  "label",
  "control",
  "indicator",
  "visibilityTrigger",
)

export const parts = anatomy.build()

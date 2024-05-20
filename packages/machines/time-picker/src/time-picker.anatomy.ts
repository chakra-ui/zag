import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("time-picker").parts(
  "cell",
  "clearTrigger",
  "column",
  "content",
  "control",
  "input",
  "label",
  "positioner",
  "root",
  "spacer",
  "trigger",
)

export const parts = anatomy.build()

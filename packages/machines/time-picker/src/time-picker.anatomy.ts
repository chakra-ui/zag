import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("time-picker").parts(
  "cell",
  "clearTrigger",
  "content",
  "contentColumn",
  "control",
  "input",
  "label",
  "positioner",
  "root",
  "trigger",
)

export const parts = anatomy.build()

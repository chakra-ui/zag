import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("date-picker").parts(
  "cellTrigger",
  "clearTrigger",
  "content",
  "control",
  "grid",
  "header",
  "input",
  "label",
  "monthSelect",
  "nextTrigger",
  "positioner",
  "prevTrigger",
  "trigger",
  "viewTrigger",
  "yearSelect",
)

export const parts = anatomy.build()

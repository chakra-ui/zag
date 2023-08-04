import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("date-picker").parts(
  "cellTrigger",
  "clearTrigger",
  "content",
  "control",
  "grid",
  "input",
  "monthSelect",
  "nextTrigger",
  "positioner",
  "prevTrigger",
  "rowHeader",
  "trigger",
  "viewTrigger",
  "yearSelect",
)

export const parts = anatomy.build()

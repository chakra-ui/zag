import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("date-picker").parts(
  "label",
  "control",
  "trigger",
  "content",
  "input",
  "header",
  "viewTrigger",
  "cellTrigger",
  "nextTrigger",
  "prevTrigger",
  "clearTrigger",
  "grid",
  "monthSelect",
  "yearSelect",
)

export const parts = anatomy.build()

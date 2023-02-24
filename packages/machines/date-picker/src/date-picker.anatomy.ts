import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("date-picker").parts(
  "root",
  "label",
  "trigger",
  "field",
  "group",
  "cell",
  "cellTrigger",
  "nextTrigger",
  "prevTrigger",
  "clearTrigger",
  "grid",
)

export const parts = anatomy.build()

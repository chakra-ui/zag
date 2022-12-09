import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("date-picker").parts(
  "root",
  "label",
  "cell",
  "cellTrigger",
  "nextTrigger",
  "prevTrigger",
  "grid",
)
export const parts = anatomy.build()

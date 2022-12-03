import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("editable").parts(
  "root",
  "area",
  "preview",
  "input",
  "editButton",
  "submitButton",
  "cancelButton",
)

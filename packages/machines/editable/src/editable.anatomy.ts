import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("editable").parts(
  "root",
  "area",
  "label",
  "preview",
  "input",
  "editButton",
  "submitButton",
  "cancelButton",
  "controlGroup",
)
export const parts = anatomy.build()

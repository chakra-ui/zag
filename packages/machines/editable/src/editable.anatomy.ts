import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("editable").parts(
  "root",
  "area",
  "label",
  "preview",
  "input",
  "editButton", // TODO editTrigger
  "submitButton", // TODO submitTrigger
  "cancelButton", // TODO cancelTrigger
  "controlGroup", // TODO controls
)
export const parts = anatomy.build()

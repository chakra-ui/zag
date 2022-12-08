import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("radio-group").parts(
  "root",
  "label",
  "radio",
  "radioLabel",
  "radioControl", // TODO rename to radioControl
  "itemInput", // TODO rename to radioInput
)
export const parts = anatomy.build()

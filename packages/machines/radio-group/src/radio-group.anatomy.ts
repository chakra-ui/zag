import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("radio-group").parts(
  "root",
  "label",
  "item", // TODO rename to radio
  "itemLabel", // TODO rename to radioLabel
  "itemControl", // TODO rename to radioControl
  "itemInput", // TODO rename to radioInput
)
export const parts = anatomy.build()

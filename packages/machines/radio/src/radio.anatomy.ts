import { createAnatomy } from "@zag-js/anatomy"
// TODO rename package to @zag-js/radio-group

export const anatomy = createAnatomy("radio").parts(
  "root",
  "label",
  "item", // TODO rename to radio
  "itemLabel", // TODO rename to radioLabel
  "itemControl", // TODO rename to radioControl
  "itemInput", // TODO rename to radioInput
)
export const parts = anatomy.build()

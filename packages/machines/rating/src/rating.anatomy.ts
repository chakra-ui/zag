import { createAnatomy } from "@zag-js/anatomy"

// TODO rename package to @zag-js/rating-group
export const anatomy = createAnatomy("rating").parts(
  "root",
  "input", // TODO rename to hiddenInput
  "label",
  "item", // TODO reanme to rating
  "itemGroup", // TODO rename to controls
)
export const parts = anatomy.build()

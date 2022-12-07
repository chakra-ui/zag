import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("numberInput").parts(
  "root",
  "label",
  "group", // TODO rename to controls
  "input",
  "spinButton", // TODO kill this one
  // incrementTrigger
  // decrementTrigger
  "scrubber",
)
export const parts = anatomy.build()

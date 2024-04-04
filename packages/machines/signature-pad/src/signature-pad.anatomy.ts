import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("signature-pad").parts(
  "root",
  "control",
  "layer",
  "layerPath",
  "line",
  "clearTrigger",
  "label",
)

export const parts = anatomy.build()

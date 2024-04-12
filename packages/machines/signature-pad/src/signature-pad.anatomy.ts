import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("signature-pad").parts(
  "root",
  "control",
  "segment",
  "segmentPath",
  "guide",
  "clearTrigger",
  "label",
)

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("dnd").parts(
  "root",
  "draggable",
  "dropTarget",
  "dropIndicator",
  "dragHandle",
  "dragPreview",
)

export const parts = anatomy.build()

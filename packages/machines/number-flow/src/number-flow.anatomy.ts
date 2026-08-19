import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("number-flow").parts(
  "root",
  "valueText",
  "digit",
  "digitTrack",
  "digitCell",
  "symbol",
)

export const parts = anatomy.build()

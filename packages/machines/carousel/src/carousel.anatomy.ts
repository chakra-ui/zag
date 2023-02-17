import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("carousel").parts(
  "root",
  "viewport",
  "slideGroup",
  "slide",
  "previousTrigger",
  "nextTrigger",
  "indicatorGroup",
  "indicator",
)

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("carousel").parts(
  "root",
  "itemGroup",
  "item",
  "control",
  "nextTrigger",
  "previousTrigger",
  "indicatorGroup",
  "indicator",
  "autoplayTrigger",
  "progressText",
)

export const parts = anatomy.build()

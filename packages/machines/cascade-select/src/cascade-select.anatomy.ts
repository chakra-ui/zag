import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("cascade-select").parts(
  "root",
  "label",
  "control",
  "trigger",
  "indicator",
  "valueText",
  "clearTrigger",
  "positioner",
  "content",
  "level",
  "item",
  "itemText",
  "itemIndicator",
)

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("cascader").parts(
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
  "levelContent",
  "item",
  "itemText",
  "itemIndicator",
)

export const parts = anatomy.build()

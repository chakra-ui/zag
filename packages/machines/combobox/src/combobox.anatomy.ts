import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("combobox").parts(
  "empty",
  "root",
  "clearTrigger",
  "content",
  "control",
  "input",
  "item",
  "itemGroup",
  "itemGroupLabel",
  "itemIndicator",
  "itemText",
  "label",
  "list",
  "positioner",
  "separator",
  "trigger",
  "chipGroup",
  "chip",
  "chipRemoveTrigger",
)
export const parts = anatomy.build()

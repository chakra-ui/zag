import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tree-view").parts(
  "root",
  "label",

  "tree",
  "item",
  "itemText",
  "itemIndicator",

  "branch",
  "branchTrigger",
  "branchContent",
)

export const parts = anatomy.build()

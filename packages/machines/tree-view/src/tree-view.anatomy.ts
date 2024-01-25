import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tree-view").parts(
  "root",
  "label",
  "tree",
  "item",
  "itemText",
  "branch",
  "branchControl",
  "branchTrigger",
  "branchContent",
  "branchText",
  "branchIndicator",
)

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tree-view").parts(
  "cell",
  "indentGuide",
  "label",
  "node",
  "nodeCheckbox",
  "nodeExpandTrigger",
  "nodeGroup",
  "nodeGroupContent",
  "nodeIndicator",
  "nodeRenameInput",
  "nodeText",
  "root",
  "tree",
)

export const parts = anatomy.build()

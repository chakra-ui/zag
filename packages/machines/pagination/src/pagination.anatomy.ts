import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("pagination").parts(
  "root",
  "item", // TODO rename to pageTrigger
  "ellipsis",
  "prevItem", // TODO rename to nextPageTrigger
  "nextItem", // TODO rename to prevPageTrigger
)
export const parts = anatomy.build()

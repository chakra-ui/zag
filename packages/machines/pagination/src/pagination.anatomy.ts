import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("pagination").parts(
  "root",
  "pageTrigger",
  "ellipsis",
  "prevPageTrigger",
  "nextPageTrigger",
)
export const parts = anatomy.build()

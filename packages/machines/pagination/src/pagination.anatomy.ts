import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("pagination").parts(
  "root",
  "item",
  "ellipsis",
  "firstTrigger",
  "prevTrigger",
  "nextTrigger",
  "lastTrigger",
)

export const parts = anatomy.build()

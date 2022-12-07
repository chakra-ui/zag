import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("pagination").parts("root", "item", "ellipsis", "prevItem", "nextItem")
export const parts = anatomy.build()

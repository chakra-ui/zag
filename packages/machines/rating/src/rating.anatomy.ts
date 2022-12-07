import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("rating").parts("root", "input", "label", "item", "itemGroup")
export const parts = anatomy.build()

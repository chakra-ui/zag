import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("accordion").parts("root", "item", "itemTrigger", "itemContent", "itemIndicator")
export const parts = anatomy.build()

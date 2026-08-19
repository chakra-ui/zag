import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("toolbar").parts("root", "group", "separator", "item")
export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("accordion").parts("root", "item", "trigger", "content")
export const parts = anatomy.build()

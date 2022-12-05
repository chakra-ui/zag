import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("hoverCard").parts("arrow", "arrowInner", "trigger", "positioner", "content")
export const parts = anatomy.build()

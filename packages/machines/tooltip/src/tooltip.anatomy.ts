import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tooltip").parts("trigger", "arrow", "arrowTip", "positioner", "content")
export const parts = anatomy.build()

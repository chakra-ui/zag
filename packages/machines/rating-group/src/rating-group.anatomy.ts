import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("rating-group").parts("root", "label", "item", "control")
export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("rating-group").parts("root", "label", "rating", "control")
export const parts = anatomy.build()

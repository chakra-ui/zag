import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("rating-group").parts("root", "hiddenInput", "label", "rating", "control")
export const parts = anatomy.build()

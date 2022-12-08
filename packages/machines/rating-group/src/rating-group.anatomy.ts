import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("rating").parts("root", "hiddenInput", "label", "rating", "controls")
export const parts = anatomy.build()

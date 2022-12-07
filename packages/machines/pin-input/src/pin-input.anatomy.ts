import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("pinInput").parts("root", "label", "hiddenInput", "input")
export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("clipboard").parts("trigger", "indicator")

export const parts = anatomy.build()

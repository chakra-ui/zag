import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("toggle", ["root", "indicator"])

export const parts = anatomy.build()

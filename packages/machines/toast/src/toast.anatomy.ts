import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("toast").parts("root", "title", "description", "closeButton")
export const parts = anatomy.build()

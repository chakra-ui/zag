import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("toggle-group").parts("root", "toggle")
export const parts = anatomy.build()

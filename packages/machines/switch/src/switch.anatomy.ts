import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("switch").parts("root", "label", "control", "thumb")
export const parts = anatomy.build()

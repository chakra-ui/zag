import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("checkbox").parts("root", "input", "label", "control")
export const parts = anatomy.build()

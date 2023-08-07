import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("checkbox").parts("root", "label", "control")
export const parts = anatomy.build()

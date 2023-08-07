import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("pinInput").parts("root", "label", "input", "control")
export const parts = anatomy.build()

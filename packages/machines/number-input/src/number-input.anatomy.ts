import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("numberInput").parts("root", "label", "group", "input", "spinButton", "scrubber")
export const parts = anatomy.build()

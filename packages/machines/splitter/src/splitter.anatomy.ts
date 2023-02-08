import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("splitter").parts("root", "panel", "toggleTrigger", "resizeTrigger")

export const parts = anatomy.build()

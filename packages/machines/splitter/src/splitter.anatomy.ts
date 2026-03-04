import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("splitter").parts("root", "panel", "resizeTrigger", "resizeTriggerIndicator")

export const parts = anatomy.build()

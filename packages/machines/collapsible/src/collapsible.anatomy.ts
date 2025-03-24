import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("collapsible").parts("root", "trigger", "content", "indicator")

export const parts = anatomy.build()

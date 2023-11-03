import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("collapsible").parts("root", "trigger", "content")

export const parts = anatomy.build()

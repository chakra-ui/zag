import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("tabs").parts("root", "tablist", "trigger", "contentGroup", "content", "indicator")
export const parts = anatomy.build()

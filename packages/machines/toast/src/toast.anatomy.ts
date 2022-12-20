import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("toast").parts("group", "root", "title", "description", "closeTrigger")
export const parts = anatomy.build()

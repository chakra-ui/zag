import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("scroll-area").parts("root", "trigger", "indicator", "progress")

export const parts = anatomy.build()

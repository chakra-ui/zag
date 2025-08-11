import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("scroll-view").parts("root", "viewport", "content", "scrollbar", "thumb", "corner")

export const parts = anatomy.build()

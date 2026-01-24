import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("marquee").parts("root", "viewport", "content", "edge", "item")

export const parts = anatomy.build()

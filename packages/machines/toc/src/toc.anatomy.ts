import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("toc").parts("root", "title", "list", "item", "link", "indicator")
export const parts = anatomy.build()

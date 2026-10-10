import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("toc").parts("root", "nav", "title", "list", "item", "link", "indicator")
export const parts = anatomy.build()

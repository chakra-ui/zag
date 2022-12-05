import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("radio").parts("root", "label", "item", "itemLabel", "itemControl", "itemInput")
export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("meter").parts("root", "label", "track", "indicator", "valueText")

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("progress").parts("root", "label", "track", "range", "valueText", "indicator")

export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("field").parts("root", "label", "control", "helperText", "errorText", "indicator")

export const parts = anatomy.build()

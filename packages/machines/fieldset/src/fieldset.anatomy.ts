import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("fieldset").parts("root", "legend", "helperText", "errorText")

export const parts = anatomy.build()

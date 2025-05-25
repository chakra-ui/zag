import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("password-input").parts("root", "input", "label", "indicator", "visibilityTrigger")

export const parts = anatomy.build()

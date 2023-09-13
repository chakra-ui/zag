import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("disclosure").parts("button", "disclosure")

export const parts = anatomy.build()

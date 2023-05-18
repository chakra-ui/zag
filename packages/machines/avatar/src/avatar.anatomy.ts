import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("avatar").parts("root", "image", "fallback")

export const parts = anatomy.build()

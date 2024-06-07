import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("qr-code").parts("root", "svg", "path", "image")

export const parts = anatomy.build()

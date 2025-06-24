import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("qr-code").parts("root", "frame", "pattern", "overlay", "downloadTrigger")

export const parts = anatomy.build()

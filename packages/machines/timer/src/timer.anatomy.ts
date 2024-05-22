import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("timer").parts("root", "segment", "control", "separator")

export const parts = anatomy.build()

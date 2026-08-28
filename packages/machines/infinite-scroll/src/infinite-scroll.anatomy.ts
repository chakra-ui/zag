import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("infinite-scroll").parts("sentinel", "indicator")

export const parts = anatomy.build()

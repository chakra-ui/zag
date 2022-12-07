import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("pinInput").parts("root", "label", "hiddenInput", "input") // TODO add controls
export const parts = anatomy.build()

import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("file-upload").parts("root", "input", "trigger", "label", "deleteTrigger")

export const parts = anatomy.build()

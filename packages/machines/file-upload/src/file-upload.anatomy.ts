import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("file-upload").parts("root", "dropzone", "trigger", "label", "deleteTrigger")

export const parts = anatomy.build()

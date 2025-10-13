import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("image-cropper").parts("root", "viewport", "image", "selection", "handle")

export const parts = anatomy.build()

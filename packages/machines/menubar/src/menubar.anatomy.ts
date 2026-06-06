import { createAnatomy } from "@zag-js/anatomy"

// The menubar is a thin coordinator. The menu triggers (rendered by the menu machine)
// act as the menubar items, so the menubar only owns the `root` part.
export const anatomy = createAnatomy("menubar").parts("root")

export const parts = anatomy.build()

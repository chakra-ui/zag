import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { ToggleGroup } from "../src/toggle-group"

document.querySelectorAll<HTMLElement>(".toggle-group").forEach((rootEl) => {
  const toggleGroup = new ToggleGroup(rootEl, {
    id: nanoid(),
    multiple: true,
  })

  toggleGroup.init()
})

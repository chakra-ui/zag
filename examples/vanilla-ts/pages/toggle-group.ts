import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/toggle-group.module.css"

import { nanoid } from "nanoid"
import { ToggleGroup } from "../src/toggle-group"

document.querySelectorAll<HTMLElement>(".toggle-group").forEach((rootEl) => {
  const toggleGroup = new ToggleGroup(rootEl, {
    id: nanoid(),
    multiple: true,
  })

  toggleGroup.init()
})

import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/floating-panel.module.css"

import { nanoid } from "nanoid"
import { FloatingPanel } from "../src/floating-panel"

document.querySelectorAll<HTMLElement>(".floating-panel").forEach((rootEl) => {
  const floatingPanel = new FloatingPanel(rootEl, {
    id: nanoid(),
  })

  floatingPanel.init()
})

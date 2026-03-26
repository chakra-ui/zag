import "../../shared/styles/style.module.css"

import { nanoid } from "nanoid"
import { FloatingPanel } from "../src/floating-panel"

document.querySelectorAll<HTMLElement>(".floating-panel").forEach((rootEl) => {
  const floatingPanel = new FloatingPanel(rootEl, {
    id: nanoid(),
  })

  floatingPanel.init()
})

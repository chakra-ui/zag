import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/menu.module.css"

import { nanoid } from "nanoid"
import { ContextMenu } from "../src/context-menu"

document.querySelectorAll<HTMLElement>(".context-menu-root").forEach((rootEl) => {
  const contextMenu = new ContextMenu(rootEl, {
    id: nanoid(),
  })

  contextMenu.init()
})

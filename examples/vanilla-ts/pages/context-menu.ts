import "@styles/global.css"
import "@styles/menu.css"

import { nanoid } from "nanoid"
import { ContextMenu } from "../src/context-menu"

document.querySelectorAll<HTMLElement>(".context-menu-root").forEach((rootEl) => {
  const contextMenu = new ContextMenu(rootEl, {
    id: nanoid(),
  })

  contextMenu.init()
})

import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/navigation-menu.module.css"
import "../../../shared/src/css/navigation-menu-viewport.module.css"

import { nanoid } from "nanoid"
import { NavigationMenu } from "../src/navigation-menu"

document.querySelectorAll<HTMLElement>(".nav-menu-root").forEach((rootEl) => {
  const navMenu = new NavigationMenu(rootEl, {
    id: nanoid(),
  })

  navMenu.init()
})

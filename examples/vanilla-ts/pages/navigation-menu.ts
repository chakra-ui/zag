import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { NavigationMenu } from "../src/navigation-menu"

document.querySelectorAll<HTMLElement>(".nav-menu-root").forEach((rootEl) => {
  const navMenu = new NavigationMenu(rootEl, {
    id: nanoid(),
  })

  navMenu.init()
})

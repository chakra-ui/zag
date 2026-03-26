import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/menu.module.css"

import { nanoid } from "nanoid"
import { Menu } from "../src/menu"

document.querySelectorAll<HTMLElement>(".menu").forEach((rootEl) => {
  const menu = new Menu(rootEl, {
    id: nanoid(),
  })

  menu.init()
})

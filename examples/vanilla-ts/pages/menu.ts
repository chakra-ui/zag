import "../../shared/styles/style.module.css"

import { nanoid } from "nanoid"
import { Menu } from "../src/menu"

document.querySelectorAll<HTMLElement>(".menu").forEach((rootEl) => {
  const menu = new Menu(rootEl, {
    id: nanoid(),
  })

  menu.init()
})

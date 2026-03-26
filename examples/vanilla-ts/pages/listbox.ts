import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/listbox.module.css"

import { nanoid } from "nanoid"
import { Listbox } from "../src/listbox"

document.querySelectorAll<HTMLElement>(".listbox-root").forEach((rootEl) => {
  const listbox = new Listbox(rootEl, {
    id: nanoid(),
  })

  listbox.init()
})

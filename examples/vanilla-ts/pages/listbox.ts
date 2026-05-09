import "@styles/global.css"
import "@styles/listbox.css"

import { nanoid } from "nanoid"
import { Listbox } from "../src/listbox"

document.querySelectorAll<HTMLElement>(".listbox-root").forEach((rootEl) => {
  const listbox = new Listbox(rootEl, {
    id: nanoid(),
  })

  listbox.init()
})

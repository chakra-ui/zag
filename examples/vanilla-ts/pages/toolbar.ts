import "@styles/global.css"
import "@styles/toolbar.css"

import { nanoid } from "nanoid"
import { Toolbar } from "../src/toolbar"

document.querySelectorAll<HTMLElement>(".toolbar").forEach((rootEl) => {
  const toolbar = new Toolbar(rootEl, {
    id: nanoid(),
  })

  toolbar.init()
})

import "../../shared/styles/style.module.css"

import { nanoid } from "nanoid"
import { Dialog } from "../src/dialog"

document.querySelectorAll<HTMLElement>(".dialog").forEach((rootEl) => {
  const dialog = new Dialog(rootEl, {
    id: nanoid(),
  })

  dialog.init()
})

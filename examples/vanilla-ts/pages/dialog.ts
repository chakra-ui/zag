import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/dialog.module.css"

import { nanoid } from "nanoid"
import { Dialog } from "../src/dialog"

document.querySelectorAll<HTMLElement>(".dialog").forEach((rootEl) => {
  const dialog = new Dialog(rootEl, {
    id: nanoid(),
  })

  dialog.init()
})

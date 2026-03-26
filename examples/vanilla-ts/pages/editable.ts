import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/editable.module.css"

import { nanoid } from "nanoid"
import { Editable } from "../src/editable"

document.querySelectorAll<HTMLElement>(".editable-root").forEach((rootEl) => {
  const editable = new Editable(rootEl, {
    id: nanoid(),
  })

  editable.init()
})

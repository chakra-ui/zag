import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { Editable } from "../src/editable"

document.querySelectorAll<HTMLElement>(".editable-root").forEach((rootEl) => {
  const editable = new Editable(rootEl, {
    id: nanoid(),
  })

  editable.init()
})

import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/checkbox.module.css"

import { nanoid } from "nanoid"
import { Checkbox } from "../src/checkbox"

document.querySelectorAll<HTMLElement>(".checkbox").forEach((rootEl) => {
  const checkbox = new Checkbox(rootEl, {
    id: nanoid(),
  })

  checkbox.init()
})

import "@styles/global.css"
import "@styles/checkbox.css"

import { nanoid } from "nanoid"
import { Checkbox } from "../src/checkbox"

document.querySelectorAll<HTMLElement>(".checkbox").forEach((rootEl) => {
  const checkbox = new Checkbox(rootEl, {
    id: nanoid(),
  })

  checkbox.init()
})

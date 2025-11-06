import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { Switch } from "../src/switch"

document.querySelectorAll<HTMLElement>(".switch").forEach((rootEl) => {
  const switchEl = new Switch(rootEl, {
    id: nanoid(),
  })

  switchEl.init()
})

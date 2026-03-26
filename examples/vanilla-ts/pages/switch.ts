import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/switch.module.css"

import { nanoid } from "nanoid"
import { Switch } from "../src/switch"

document.querySelectorAll<HTMLElement>(".switch").forEach((rootEl) => {
  const switchEl = new Switch(rootEl, {
    id: nanoid(),
  })

  switchEl.init()
})

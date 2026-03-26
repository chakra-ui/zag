import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/collapsible.module.css"

import { nanoid } from "nanoid"
import { Collapsible } from "../src/collapsible"

document.querySelectorAll<HTMLElement>(".collapsible-root").forEach((rootEl) => {
  const collapsible = new Collapsible(rootEl, {
    id: nanoid(),
  })

  collapsible.init()
})

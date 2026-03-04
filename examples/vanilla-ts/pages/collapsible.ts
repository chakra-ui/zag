import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { Collapsible } from "../src/collapsible"

document.querySelectorAll<HTMLElement>(".collapsible-root").forEach((rootEl) => {
  const collapsible = new Collapsible(rootEl, {
    id: nanoid(),
  })

  collapsible.init()
})

import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { Tooltip } from "../src/tooltip"

document.querySelectorAll<HTMLElement>(".tooltip").forEach((rootEl) => {
  const tooltip = new Tooltip(rootEl, {
    id: nanoid(),
  })

  tooltip.init()
})

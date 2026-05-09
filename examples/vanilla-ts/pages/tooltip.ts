import "@styles/global.css"
import "@styles/tooltip.css"

import { nanoid } from "nanoid"
import { Tooltip } from "../src/tooltip"

document.querySelectorAll<HTMLElement>(".tooltip").forEach((rootEl) => {
  const tooltip = new Tooltip(rootEl, {
    id: nanoid(),
  })

  tooltip.init()
})

import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/tooltip.module.css"

import { nanoid } from "nanoid"
import { Tooltip } from "../src/tooltip"

document.querySelectorAll<HTMLElement>(".tooltip").forEach((rootEl) => {
  const tooltip = new Tooltip(rootEl, {
    id: nanoid(),
  })

  tooltip.init()
})

import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/popover.module.css"

import { Popover } from "../src/popover"
import { nanoid } from "nanoid"

document.querySelectorAll<HTMLElement>(".popover").forEach((rootEl) => {
  const popover = new Popover(rootEl, {
    id: nanoid(),
    positioning: {
      placement: "right",
    },
  })
  popover.init()
})

import "@styles/global.css"
import "@styles/popover.css"

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

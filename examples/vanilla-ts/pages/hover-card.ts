import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { HoverCard } from "../src/hover-card"

document.querySelectorAll<HTMLElement>(".hover-card-root").forEach((rootEl) => {
  const hoverCard = new HoverCard(rootEl, {
    id: nanoid(),
  })

  hoverCard.init()
})

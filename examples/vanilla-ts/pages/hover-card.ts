import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/hover-card.module.css"

import { nanoid } from "nanoid"
import { HoverCard } from "../src/hover-card"

document.querySelectorAll<HTMLElement>(".hover-card-root").forEach((rootEl) => {
  const hoverCard = new HoverCard(rootEl, {
    id: nanoid(),
  })

  hoverCard.init()
})

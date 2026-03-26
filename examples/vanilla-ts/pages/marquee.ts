import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/marquee.module.css"

import { nanoid } from "nanoid"
import { Marquee } from "../src/marquee"

document.querySelectorAll<HTMLElement>(".marquee-root").forEach((rootEl) => {
  const marquee = new Marquee(rootEl, {
    id: nanoid(),
  })

  marquee.init()
})

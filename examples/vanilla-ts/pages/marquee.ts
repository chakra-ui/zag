import "@styles/global.css"
import "@styles/marquee.css"

import { nanoid } from "nanoid"
import { Marquee } from "../src/marquee"

document.querySelectorAll<HTMLElement>(".marquee-root").forEach((rootEl) => {
  const marquee = new Marquee(rootEl, {
    id: nanoid(),
  })

  marquee.init()
})

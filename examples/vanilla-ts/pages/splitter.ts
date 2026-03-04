import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { Splitter } from "../src/splitter"

document.querySelectorAll<HTMLElement>(".splitter").forEach((rootEl) => {
  const splitter = new Splitter(rootEl, {
    id: nanoid(),
    panels: [{ id: "a" }, { id: "b" }, { id: "c" }],
  })

  splitter.init()
})

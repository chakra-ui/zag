import "@styles/global.css"
import "@styles/accordion.css"

import { Accordion } from "../src/accordion"
import { nanoid } from "nanoid"

document.querySelectorAll<HTMLElement>(".accordion").forEach((rootEl) => {
  const accordion = new Accordion(rootEl, { id: nanoid(), multiple: true })
  accordion.init()
})

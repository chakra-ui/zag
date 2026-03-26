import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/accordion.module.css"

import { Accordion } from "../src/accordion"
import { nanoid } from "nanoid"

document.querySelectorAll<HTMLElement>(".accordion").forEach((rootEl) => {
  const accordion = new Accordion(rootEl, { id: nanoid(), multiple: true })
  accordion.init()
})

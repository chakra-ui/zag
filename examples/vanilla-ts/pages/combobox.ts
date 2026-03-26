import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/combobox.module.css"

import { Combobox } from "../src/combobox"
import { nanoid } from "nanoid"

document.querySelectorAll<HTMLElement>(".combobox").forEach((rootEl) => {
  const combobox = new Combobox(rootEl, { id: nanoid() })
  combobox.init()
})

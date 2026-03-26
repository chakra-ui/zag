import "../../shared/styles/style.module.css"

import { Combobox } from "../src/combobox"
import { nanoid } from "nanoid"

document.querySelectorAll<HTMLElement>(".combobox").forEach((rootEl) => {
  const combobox = new Combobox(rootEl, { id: nanoid() })
  combobox.init()
})

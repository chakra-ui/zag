import "../../shared/styles/style.module.css"

import { nanoid } from "nanoid"
import { PinInput } from "../src/pin-input"

document.querySelectorAll<HTMLElement>(".pin-input").forEach((rootEl) => {
  const pinInput = new PinInput(rootEl, {
    id: nanoid(),
    placeholder: "○",
  })

  pinInput.init()
})

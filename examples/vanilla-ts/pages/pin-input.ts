import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/pin-input.module.css"

import { nanoid } from "nanoid"
import { PinInput } from "../src/pin-input"

document.querySelectorAll<HTMLElement>(".pin-input").forEach((rootEl) => {
  const pinInput = new PinInput(rootEl, {
    id: nanoid(),
    placeholder: "○",
  })

  pinInput.init()
})

import "@styles/global.css"
import "@styles/pin-input.css"

import { nanoid } from "nanoid"
import { PinInput } from "../src/pin-input"

document.querySelectorAll<HTMLElement>(".pin-input").forEach((rootEl) => {
  const pinInput = new PinInput(rootEl, {
    id: nanoid(),
    count: 6,
    placeholder: "○",
  })

  pinInput.init()
})

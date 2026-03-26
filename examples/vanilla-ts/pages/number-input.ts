import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { NumberInput } from "../src/number-input"

document.querySelectorAll<HTMLElement>(".number-input").forEach((rootEl) => {
  const numberInput = new NumberInput(rootEl, {
    id: nanoid(),
    min: 0,
    max: 100,
  })

  numberInput.init()
})

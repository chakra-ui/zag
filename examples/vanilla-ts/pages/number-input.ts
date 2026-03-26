import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/number-input.module.css"

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

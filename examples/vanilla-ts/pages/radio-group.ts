import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { RadioGroup } from "../src/radio-group"

document.querySelectorAll<HTMLElement>(".radio-group").forEach((rootEl) => {
  const radioGroup = new RadioGroup(rootEl, {
    id: nanoid(),
    defaultValue: "option1",
  })

  radioGroup.init()
})

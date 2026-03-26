import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/radio-group.module.css"

import { nanoid } from "nanoid"
import { RadioGroup } from "../src/radio-group"

document.querySelectorAll<HTMLElement>(".radio-group").forEach((rootEl) => {
  const radioGroup = new RadioGroup(rootEl, {
    id: nanoid(),
    defaultValue: "option1",
  })

  radioGroup.init()
})

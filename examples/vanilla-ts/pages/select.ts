import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/select.module.css"

import { nanoid } from "nanoid"
import { Select } from "../src/select"

document.querySelectorAll<HTMLElement>(".select-root").forEach((rootEl) => {
  const select = new Select(rootEl, {
    id: nanoid(),
  })

  select.init()
})

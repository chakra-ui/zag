import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/cascade-select.module.css"

import { nanoid } from "nanoid"
import { CascadeSelect } from "../src/cascade-select"

document.querySelectorAll<HTMLElement>(".cascade-select-root").forEach((rootEl) => {
  const cascadeSelect = new CascadeSelect(rootEl, {
    id: nanoid(),
  })

  cascadeSelect.init()
})

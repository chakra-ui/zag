import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { CascadeSelect } from "../src/cascade-select"

document.querySelectorAll<HTMLElement>(".cascade-select-root").forEach((rootEl) => {
  const cascadeSelect = new CascadeSelect(rootEl, {
    id: nanoid(),
  })

  cascadeSelect.init()
})

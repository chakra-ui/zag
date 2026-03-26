import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/clipboard.module.css"

import { nanoid } from "nanoid"
import { Clipboard } from "../src/clipboard"

document.querySelectorAll<HTMLElement>(".clipboard-root").forEach((rootEl) => {
  const defaultValue = rootEl.dataset.value || "https://github.com/chakra-ui/zag"

  const clipboardComponent = new Clipboard(rootEl, {
    id: nanoid(),
    value: defaultValue,
  })

  clipboardComponent.init()
})

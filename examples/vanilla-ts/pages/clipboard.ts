import "../../shared/styles/style.module.css"

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

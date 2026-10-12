import "@styles/global.css"
import "@styles/steps.css"

import { nanoid } from "nanoid"
import { Steps } from "../src/steps"

document.querySelectorAll<HTMLElement>(".steps-root").forEach((rootEl) => {
  const items = Array.from(rootEl.querySelectorAll<HTMLElement>(".steps-item")).map((el) => ({
    value: el.dataset.value!,
  }))

  const stepsComponent = new Steps(rootEl, { id: nanoid(), items })

  stepsComponent.init()
})

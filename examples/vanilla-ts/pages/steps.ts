import "../../shared/styles/style.module.css"

import { nanoid } from "nanoid"
import { Steps } from "../src/steps"

document.querySelectorAll<HTMLElement>(".steps-root").forEach((rootEl) => {
  const stepsComponent = new Steps(rootEl, {
    id: nanoid(),
    count: 4,
    defaultStep: 0,
  })

  stepsComponent.init()
})

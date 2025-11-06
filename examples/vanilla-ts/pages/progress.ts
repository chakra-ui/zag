import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { Progress } from "../src/progress"

document.querySelectorAll<HTMLElement>(".progress").forEach((rootEl) => {
  const progressEl = new Progress(rootEl, {
    id: nanoid(),
    defaultValue: 50,
  })

  progressEl.init()

  // Add button handlers
  const decreaseBtn = rootEl.querySelector<HTMLElement>(".progress-decrease")
  const increaseBtn = rootEl.querySelector<HTMLElement>(".progress-increase")
  const indeterminateBtn = rootEl.querySelector<HTMLElement>(".progress-indeterminate")

  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", () => {
      progressEl.api.setValue((progressEl.api.value ?? 0) - 20)
    })
  }

  if (increaseBtn) {
    increaseBtn.addEventListener("click", () => {
      progressEl.api.setValue((progressEl.api.value ?? 0) + 20)
    })
  }

  if (indeterminateBtn) {
    indeterminateBtn.addEventListener("click", () => {
      progressEl.api.setValue(null)
    })
  }
})

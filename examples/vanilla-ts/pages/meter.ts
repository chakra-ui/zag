import "@styles/global.css"
import "@styles/meter.css"

import { nanoid } from "nanoid"
import { Meter } from "../src/meter"

document.querySelectorAll<HTMLElement>(".meter-demo").forEach((demoEl) => {
  const rootEl = demoEl.querySelector<HTMLElement>(".meter")
  if (!rootEl) return

  const meterEl = new Meter(rootEl, {
    id: nanoid(),
    defaultValue: 70,
    low: 60,
    high: 85,
    optimum: 10,
  })

  meterEl.init()

  demoEl.querySelectorAll<HTMLButtonElement>("[data-testid]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = Number(button.dataset.testid?.replace("set-", ""))
      if (!Number.isNaN(value)) meterEl.api.setValue(value)
    })
  })
})

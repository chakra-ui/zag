import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { Slider } from "../src/slider"

document.querySelectorAll<HTMLElement>(".slider").forEach((rootEl) => {
  const slider = new Slider(rootEl, {
    id: nanoid(),
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
  })

  slider.init()
})

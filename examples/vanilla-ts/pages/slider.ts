import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/slider.module.css"

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

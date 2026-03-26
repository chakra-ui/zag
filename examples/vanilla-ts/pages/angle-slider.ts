import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/angle-slider.module.css"

import { nanoid } from "nanoid"
import { AngleSlider } from "../src/angle-slider"

document.querySelectorAll<HTMLElement>(".angle-slider-root").forEach((rootEl) => {
  const angleSlider = new AngleSlider(rootEl, {
    id: nanoid(),
  })

  angleSlider.init()
})

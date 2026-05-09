import "@styles/global.css"
import "@styles/angle-slider.css"

import { nanoid } from "nanoid"
import { AngleSlider } from "../src/angle-slider"

document.querySelectorAll<HTMLElement>(".angle-slider-root").forEach((rootEl) => {
  const angleSlider = new AngleSlider(rootEl, {
    id: nanoid(),
  })

  angleSlider.init()
})

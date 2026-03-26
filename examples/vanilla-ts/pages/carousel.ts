import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/carousel.module.css"

import { carouselData } from "@zag-js/shared"
import { nanoid } from "nanoid"
import { Carousel } from "../src/carousel"

document.querySelectorAll<HTMLElement>(".carousel").forEach((rootEl) => {
  const carousel = new Carousel(rootEl, {
    id: nanoid(),
    spacing: "20px",
    slidesPerPage: 2,
    slideCount: carouselData.length,
    allowMouseDrag: true,
    images: carouselData,
  })

  carousel.init()
})

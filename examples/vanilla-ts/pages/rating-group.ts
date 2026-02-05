import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { RatingGroup } from "../src/rating-group"

document.querySelectorAll<HTMLElement>(".rating").forEach((rootEl) => {
  const ratingGroup = new RatingGroup(rootEl, {
    id: nanoid(),
    defaultValue: 2.5,
    allowHalf: true,
  })

  ratingGroup.init()
})

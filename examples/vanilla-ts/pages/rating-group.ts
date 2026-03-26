import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/rating-group.module.css"

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

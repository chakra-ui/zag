import "@zag-js/shared/src/style.css"

import { Avatar } from "../src/avatar"
import { nanoid } from "nanoid"

document.querySelectorAll<HTMLElement>(".avatar").forEach((rootEl) => {
  const avatar = new Avatar(rootEl, { id: nanoid() })
  avatar.init()
})

import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/avatar.module.css"

import { Avatar } from "../src/avatar"
import { nanoid } from "nanoid"

document.querySelectorAll<HTMLElement>(".avatar").forEach((rootEl) => {
  const avatar = new Avatar(rootEl, { id: nanoid() })
  avatar.init()
})
